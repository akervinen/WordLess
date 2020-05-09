package me.aleksi.wordless

import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpHeaders
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.*
import javax.servlet.FilterChain
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
class SecurityConfiguration(private val settingsDao: SettingsDao)
    : WebSecurityConfigurerAdapter() {
    private lateinit var userDetailsService: UserDetailsService

    @Value("\${spring.profiles.active:prod}")
    private val activeProfile: String? = null

    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.inMemoryAuthentication().withUser("admin").password("{noop}admin").roles("ADMIN")
        userDetailsService = auth.defaultUserDetailsService
    }

    override fun configure(http: HttpSecurity) {
        with(http) {
            if (activeProfile == "dev")
                csrf().disable()
            else
                csrf().csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            addFilter(JwtAuthenticationFilter(authenticationManager(), settingsDao))
            addFilter(JwtAuthorizationFilter(authenticationManager(), settingsDao, userDetailsService))
            formLogin().disable()
            sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        }
    }
}

/**
 * Filter that a JWT token on successful login, and sends it back through
 * `Authorization` header and a `httpOnly` cookie.
 *
 * Also sets an additional non-`httpOnly` cookie to '1' so client-side can see when
 * they're authenticated.
 */
class JwtAuthenticationFilter(authManager: AuthenticationManager, private val settingsDao: SettingsDao)
    : UsernamePasswordAuthenticationFilter() {
    init {
        authenticationManager = authManager
        setFilterProcessesUrl("/api/auth")
    }

    override fun unsuccessfulAuthentication(request: HttpServletRequest, response: HttpServletResponse, failed: AuthenticationException?) {
        deleteCookies(request, response)
        super.unsuccessfulAuthentication(request, response, failed)
    }

    override fun successfulAuthentication(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain, authResult: Authentication) {
        val user = authResult.principal as User

        val signingKey = settingsDao.get("jwt_secret")?.let {
            Keys.hmacShaKeyFor(Base64.getDecoder().decode(it))
        } ?: return

        val token = Jwts.builder()
            .signWith(signingKey, SignatureAlgorithm.HS512)
            .setHeaderParam("typ", TOKEN_TYPE)
            .setIssuer(TOKEN_ISSUER)
            .setSubject(user.username)
            .setExpiration(Date.from(Instant.now().plus(7, ChronoUnit.DAYS)))
            .compact()

        // Set both cookies
        response.addCookie(Cookie(TOKEN_COOKIE, token).apply {
            isHttpOnly = true
            maxAge = ChronoUnit.WEEKS.duration.seconds.toInt()
        })
        response.addCookie(Cookie(TOKEN_COOKIE_PUBLIC, "1").apply {
            path = "/"
            maxAge = ChronoUnit.WEEKS.duration.seconds.toInt()
        })

        // Add header for clients that don't use cookies
        response.addHeader(HttpHeaders.AUTHORIZATION, "$TOKEN_PREFIX$token")
    }
}

class JwtAuthorizationFilter(authManager: AuthenticationManager, private val settingsDao: SettingsDao,
                             private val userDetailsService: UserDetailsService)
    : BasicAuthenticationFilter(authManager) {

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain) {
        // Only check auth on /api/ requests, otherwise authed cookie will be deleted
        // because the token cookie is on /api path.
        if (request.servletPath.startsWith("/api/"))
            getToken(request)?.let { token ->
                SecurityContextHolder.getContext().authentication = token
            } ?: run {
                SecurityContextHolder.clearContext()
                deleteCookies(request, response)
            }

        chain.doFilter(request, response)
    }

    private fun getToken(request: HttpServletRequest): UsernamePasswordAuthenticationToken? {
        val signingKey = settingsDao.get("jwt_secret")?.let {
            Keys.hmacShaKeyFor(Base64.getDecoder().decode(it))
        } ?: return null

        try {
            // First try getting a token from request headers, then from cookies
            run {
                val header = request.getHeader(HttpHeaders.AUTHORIZATION)
                if (header != null && header.startsWith(TOKEN_PREFIX)) {
                    header.replace(TOKEN_PREFIX, "")
                } else {
                    val cookie = request.cookies?.find { it.name == TOKEN_COOKIE }
                    cookie?.value
                }
            }?.let {
                // Parse and validate the token
                val claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(it)

                val username = claims.body.subject

                if (username.isNullOrEmpty())
                    return null

                // Load roles by username from InMemoryAuth.
                // This will throw an exception if a username was deleted after
                // authentication, but before token expiry.
                val authorities = userDetailsService.loadUserByUsername(username).authorities
                return UsernamePasswordAuthenticationToken(username, null, authorities)
            }
        } catch (exception: JwtException) {
            logger.warn("JWT Exception: ${exception.message}")
        } catch (exception: UsernameNotFoundException) {
            logger.warn("Valid token, but username not found!", exception)
        }
        return null
    }
}

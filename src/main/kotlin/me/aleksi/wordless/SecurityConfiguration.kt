package me.aleksi.wordless

import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.security.Keys
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
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
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.*
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Profile("!dev")
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(
    prePostEnabled = true,
    proxyTargetClass = true)
class SecurityConfiguration : WebSecurityConfigurerAdapter() {
    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.inMemoryAuthentication().withUser("admin").password("{noop}admin").roles("ADMIN")
    }

    override fun configure(http: HttpSecurity) {
        http
            .csrf().csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            .and()
            .formLogin().disable()
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
    }
}

@Profile("dev")
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(
    prePostEnabled = true,
    proxyTargetClass = true)
class DevSecurityConfiguration(private val settingsDao: SettingsDao)
    : WebSecurityConfigurerAdapter() {
    private lateinit var userDetailsService: UserDetailsService

    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.inMemoryAuthentication().withUser("admin").password("{noop}admin").roles("ADMIN")
        userDetailsService = auth.defaultUserDetailsService
    }

    override fun configure(http: HttpSecurity) {
        http
            .csrf().disable()
            .addFilter(JwtAuthenticationFilter(authenticationManager(), settingsDao))
            .addFilter(JwtAuthorizationFilter(authenticationManager(), settingsDao, userDetailsService))
            .formLogin().disable()
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
    }
}

const val TOKEN_PREFIX = "Bearer "
const val TOKEN_TYPE = "JWT"
const val TOKEN_ISSUER = "spaghetti-blog"

class JwtAuthenticationFilter(authManager: AuthenticationManager, private val settingsDao: SettingsDao)
    : UsernamePasswordAuthenticationFilter() {
    init {
        authenticationManager = authManager
        setFilterProcessesUrl("/api/login")
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

        response.addHeader(HttpHeaders.AUTHORIZATION, "$TOKEN_PREFIX$token")
    }
}

class JwtAuthorizationFilter(authManager: AuthenticationManager, private val settingsDao: SettingsDao,
                             private val userDetailsService: UserDetailsService)
    : BasicAuthenticationFilter(authManager) {

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain) {
        getToken(request)?.let { token ->
            SecurityContextHolder.getContext().authentication = token
        } ?: SecurityContextHolder.clearContext()

        chain.doFilter(request, response)
    }

    fun getToken(request: HttpServletRequest): UsernamePasswordAuthenticationToken? {
        val signingKey = settingsDao.get("jwt_secret")?.let {
            Keys.hmacShaKeyFor(Base64.getDecoder().decode(it))
        } ?: return null

        try {
            val header = request.getHeader(HttpHeaders.AUTHORIZATION)
            if (header != null && header.startsWith(TOKEN_PREFIX)) {
                val claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(header.replace(TOKEN_PREFIX, ""))

                val username = claims.body.subject

                if (username.isNullOrEmpty())
                    return null

                val authorities = userDetailsService.loadUserByUsername(username).authorities
                return UsernamePasswordAuthenticationToken(username, null, authorities)
            }
        } catch (exception: JwtException) {
            logger.warn("JWT Exception: ${exception.message}")
        }
        return null
    }
}

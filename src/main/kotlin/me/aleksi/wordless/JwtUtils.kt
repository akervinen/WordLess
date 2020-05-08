package me.aleksi.wordless

import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

// httpOnly cookie containing the JWT token
const val TOKEN_COOKIE = "jwt_token"

// non-httpOnly cookie to detect when we're authenticated in JS
const val TOKEN_COOKIE_PUBLIC = "jwt_authed"

// Token details
const val TOKEN_PREFIX = "Bearer "
const val TOKEN_TYPE = "JWT"
const val TOKEN_ISSUER = "spaghetti-blog"

fun deleteCookies(request: HttpServletRequest, response: HttpServletResponse) {
    // Delete both auth cookies
    request.cookies?.find { it.name == TOKEN_COOKIE }?.apply {
        maxAge = 0
        response.addCookie(this)
    }
    request.cookies?.find { it.name == TOKEN_COOKIE_PUBLIC }?.apply {
        maxAge = 0
        // path is null here for some reason, and cookies can only be deleted
        // if the response cookie is identical (minus value and maxage),
        // so we have to set it to "/" again
        path = "/"
        response.addCookie(this)
    }
}

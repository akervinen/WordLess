package me.aleksi.wordless

import java.time.Instant

/**
 * Data class for post data.
 */
data class Post(val id: Long = 0, val title: String = "",
                val slug: String = "", val public: Boolean = true,
                val locked: Boolean = false,
                val postedTime: Instant = Instant.now(), val editedTime: Instant? = null,
                val summary: String = "", val content: String = "",
                val comments: MutableList<Comment>? = mutableListOf(), val tags: MutableList<String>? = mutableListOf())

/**
 * Data class for post data needed for creating a new post.
 */
data class PostRequest(val title: String,
                       val public: Boolean = true, val locked: Boolean = false,
                       val summary: String = "", val content: String,
                       val tags: List<String>?)

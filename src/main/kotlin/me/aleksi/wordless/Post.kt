package me.aleksi.wordless

import java.time.Instant

data class Post(val id: Long = 0, val title: String = "",
                val slug: String = "", val public: Boolean = true,
                val locked: Boolean = false,
                val postedTime: Instant = Instant.now(), val editedTime: Instant? = null,
                val summary: String = "", val content: String = "",
                val comments: MutableList<Comment>? = mutableListOf(), val tags: MutableList<String>? = mutableListOf())

data class PostRequest(val title: String,
                       val public: Boolean = true, val locked: Boolean = false,
                       val summary: String = "", val content: String,
                       val tags: List<String>?)

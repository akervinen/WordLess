package me.aleksi.wordless

import java.time.Instant

data class Post(val id: Long, val title: String,
                val slug: String, val public: Boolean,
                val postedTime: Instant, val editedTime: Instant?,
                val summary: String, val content: String,
                val commentCount: Int? = 0)

data class PostRequest(val title: String, val public: Boolean,
                       val summary: String, val content: String)

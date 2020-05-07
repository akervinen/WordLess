package me.aleksi.wordless

import java.time.Instant

data class Comment(val id: Long = 0, val postId: Long = 0,
                   val author: String = "", val postedTime: Instant = Instant.now(),
                   val content: String = "")

data class CommentRequest(val author: String, val content: String)

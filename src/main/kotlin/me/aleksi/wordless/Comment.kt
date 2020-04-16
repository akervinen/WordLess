package me.aleksi.wordless

import java.time.Instant

data class Comment(val id: Long, val postId: Long,
                   val author: String, val postedTime: Instant,
                   val content: String)

data class CommentRequest(val author: String, val content: String)

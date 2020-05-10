package me.aleksi.wordless

import java.time.Instant

/**
 * Data class for comment data.
 */
data class Comment(val id: Long = 0, val postId: Long = 0,
                   val author: String = "", val postedTime: Instant = Instant.now(),
                   val content: String = "")

/**
 * Data class for comment data needed for creating a new comment.
 */
data class CommentRequest(val author: String, val content: String)

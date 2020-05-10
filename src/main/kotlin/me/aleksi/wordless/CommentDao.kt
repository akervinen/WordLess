package me.aleksi.wordless

import org.jdbi.v3.sqlobject.customizer.Bind
import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

/**
 * JDBI Database access object for comments.
 *
 * Implementation is generated automatically based on this interface's method annotations.
 */
interface CommentDao {
    /**
     * Get all comments of a post by [postId].
     */
    @SqlQuery("""select * from "comment" where "post_id" = :postId order by "posted_time" desc""")
    fun getComments(@Bind postId: Long): List<Comment>

    /**
     * Get one comment by its [id].
     */
    @SqlQuery("""select * from "comment" where "id" = :id""")
    fun getComment(@Bind id: Long): Comment?

    /**
     * Create a new comment with given [comment] data.
     */
    @SqlUpdate("""
        insert into "comment" ("post_id", "author", "posted_time", "content")
        values (:postId, :author, :postedTime, :content)
    """)
    @GetGeneratedKeys
    fun insert(@BindBean comment: Comment): Long

    /**
     * Delete a comment by its [id].
     */
    @SqlUpdate("""delete from "comment" where "id"=(:id)""")
    fun deleteById(@Bind("id") id: Long)
}

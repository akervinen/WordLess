package me.aleksi.wordless

import org.jdbi.v3.sqlobject.customizer.Bind
import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

interface CommentDao {
    @SqlQuery("""select * from "comment" where "post_id" = :postId order by "posted_time" desc""")
    fun getComments(@Bind postId: Long): List<Comment>

    @SqlQuery("""select * from "comment" where "id" = :id""")
    fun getComment(@Bind id: Long): Comment?

    @SqlUpdate("""
        insert into "comment" ("post_id", "author", "posted_time", "content")
        values (:postId, :author, :postedTime, :content)
    """)
    @GetGeneratedKeys
    fun insert(@BindBean comment: Comment): Long

    @SqlUpdate("""delete from "comment" where "id"=(:id)""")
    fun deleteById(@Bind("id") id: Long)
}

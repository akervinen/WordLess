package me.aleksi.wordless

import org.jdbi.v3.sqlobject.customizer.Bind
import org.jdbi.v3.sqlobject.statement.SqlQuery

interface CommentDao {
    @SqlQuery("""select * from "comment" where "post_id" = :postId order by "posted_time" desc""")
    fun getComments(@Bind postId: Long): List<Comment>
}

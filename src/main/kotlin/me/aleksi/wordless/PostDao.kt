package me.aleksi.wordless

import org.jdbi.v3.sqlobject.customizer.Bind
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

interface PostDao {
    @SqlQuery("""select * from "post" order by "posted_time" desc""")
    fun getAllPosts(): List<Post>

    @SqlQuery("""select * from "post" where "id"=(:id)""")
    fun findById(@Bind("id") id: Long): Post?

    @SqlUpdate("""delete from "post" where "id"=(:id)""")
    fun deleteById(@Bind("id") id: Long)
}

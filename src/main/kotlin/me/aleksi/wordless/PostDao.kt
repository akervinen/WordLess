package me.aleksi.wordless

import org.jdbi.v3.sqlobject.customizer.Bind
import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate

interface PostDao {
    @SqlQuery("""
        select p.*, count(c."post_id") as "comment_count" from "post" p
        left join "comment" c on p."id" = c."post_id"
        group by p."id", p."posted_time"
        order by p."posted_time" desc
    """)
    fun getAllPosts(): List<Post>

    @SqlQuery("""
        select p.*, count(c."post_id") as "comment_count" from "post" p
        left join "comment" c on p."id" = c."post_id"
        where p."id"=:id
        group by p."id"
    """)
    fun findById(@Bind("id") id: Long): Post?

    @SqlQuery("""
        select p.*, count(c."post_id") as "comment_count" from "post" p
        left join "comment" c on p."id" = c."post_id"
        where p."title" LIKE concat('%',:query,'%')
            OR p."content" LIKE concat('%',:query,'%')
            OR p."summary" LIKE concat('%',:query,'%')
        group by p."id", p."posted_time"
        order by p."posted_time" desc
    """)
    fun findByWord(@Bind query: String): List<Post>

    @SqlUpdate("""delete from "post" where "id"=(:id)""")
    fun deleteById(@Bind("id") id: Long)

    @SqlUpdate("""
        insert into "post" ("title", "slug", "public", "posted_time", "edited_time", "summary", "content")
        values (:title, :slug, :public, :postedTime, :editedTime, :summary, :content)
    """)
    @GetGeneratedKeys
    fun insert(@BindBean post: Post): Long

    @SqlUpdate("""
        update "post"
        set "title" = :title,
            "public" = :public,
            "summary" = :summary,
            "content" = :content,
            "edited_time" = :editedTime
        where "id"=(:id)
    """)
    fun update(@Bind id: Long, @BindBean post: Post)
}

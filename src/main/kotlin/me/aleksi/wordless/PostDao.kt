package me.aleksi.wordless

import org.jdbi.v3.core.result.LinkedHashMapRowReducer
import org.jdbi.v3.core.result.RowView
import org.jdbi.v3.sqlobject.config.RegisterKotlinMappers
import org.jdbi.v3.sqlobject.customizer.Bind
import org.jdbi.v3.sqlobject.customizer.BindBean
import org.jdbi.v3.sqlobject.kotlin.RegisterKotlinMapper
import org.jdbi.v3.sqlobject.statement.GetGeneratedKeys
import org.jdbi.v3.sqlobject.statement.SqlQuery
import org.jdbi.v3.sqlobject.statement.SqlUpdate
import org.jdbi.v3.sqlobject.statement.UseRowReducer

// Convenience strings, since columns need fixed names for JDBI reducer to work, i.e. post."id" should be "p_id".
private const val POST_COLUMNS = """p."id" p_id, p."title" p_title, p."slug" p_slug, p."public" p_public, """ +
    """p."locked" p_locked, p."posted_time" p_posted_time, p."edited_time" p_edited_time, """ +
    """p."summary" p_summary, p."content" p_content"""

private const val COMMENT_COLUMNS = """c."id" c_id, c."post_id" c_post_id, c."author" c_author, c."posted_time" c_posted_time, c."content" c_content"""

private const val TAG_COLUMNS = """t."id" t_id, "name" t_name"""

/**
 * JDBI data access object for post data.
 */
@RegisterKotlinMappers(
    RegisterKotlinMapper(Post::class, prefix = "p"),
    RegisterKotlinMapper(Comment::class, prefix = "c"),
    RegisterKotlinMapper(Tag::class, prefix = "t")
)
interface PostDao {
    /**
     * Get a list of all posts and their related data (comments, tags) ordered newest first.
     */
    @SqlQuery("""
        select $POST_COLUMNS, $COMMENT_COLUMNS, $TAG_COLUMNS from "post" p
        left join "comment" c on p."id" = c."post_id"
        left join "post_tags" pt on p."id" = pt."post_id"
        left join "tag" t on pt."tag_id" = t."id"
        group by p."id", p."posted_time", c."id", t."id"
        order by p."posted_time" desc
    """)
    @UseRowReducer(PostWithExtras::class)
    fun getAllPosts(): List<Post>

    /**
     * Get one post with a given [id].
     */
    @SqlQuery("""
        select $POST_COLUMNS, $COMMENT_COLUMNS, $TAG_COLUMNS from "post" p
        left join "comment" c on p."id" = c."post_id"
        left join "post_tags" pt on p."id" = pt."post_id"
        left join "tag" t on pt."tag_id" = t."id"
        where p."id"=:id
        group by p."id", c."id", t."id"
    """)
    @UseRowReducer(PostWithExtras::class)
    fun findById(@Bind("id") id: Long): Post?

    /**
     * Find posts with a given tag by [tagName].
     */
    @SqlQuery("""
        select $POST_COLUMNS, $COMMENT_COLUMNS, $TAG_COLUMNS from "post_tags" pt
        inner join "post" p on pt."post_id" = p."id"
        left join "tag" t on pt."tag_id" = t."id"
        left join "comment" c on p."id" = c."post_id"
        where t."name" = :tagName
        order by p."posted_time" desc
    """)
    @UseRowReducer(PostWithExtras::class)
    fun findByTagName(@Bind tagName: String): List<Post>

    /**
     * Find posts containing a given string [query]. Very simple wildcard search.
     */
    @SqlQuery("""
        select $POST_COLUMNS, $COMMENT_COLUMNS, $TAG_COLUMNS from "post" p
        left join "comment" c on p."id" = c."post_id"
        left join "post_tags" pt on p."id" = pt."post_id"
        left join "tag" t on pt."tag_id" = t."id"
        where p."title" LIKE concat('%',:query,'%')
            OR p."content" LIKE concat('%',:query,'%')
            OR p."summary" LIKE concat('%',:query,'%')
        group by p."id", p."posted_time", c."id", t."id"
        order by p."posted_time" desc
    """)
    @UseRowReducer(PostWithExtras::class)
    fun findByWord(@Bind query: String): List<Post>

    /**
     * Find posts with a given tag by [tagName] and containing the given string [query].
     */
    @SqlQuery("""
        select $POST_COLUMNS, $COMMENT_COLUMNS, $TAG_COLUMNS from "post" p
        left join "comment" c on p."id" = c."post_id"
        left join "post_tags" pt on p."id" = pt."post_id"
        left join "tag" t on pt."tag_id" = t."id"
        where t."name" = :tagName and (p."title" like concat('%',:query,'%')
            or p."content" like concat('%',:query,'%')
            or p."summary" like concat('%',:query,'%'))
        group by p."id", p."posted_time", c."id", t."id"
        order by p."posted_time" desc
    """)
    @UseRowReducer(PostWithExtras::class)
    fun findByWordAndTag(@Bind query: String, @Bind tagName: String): List<Post>

    /**
     * Delete a post by its [id].
     */
    @SqlUpdate("""delete from "post" where "id"=(:id)""")
    fun deleteById(@Bind("id") id: Long)

    /**
     * Create a new post with given [post] data.
     */
    @SqlUpdate("""
        insert into "post" ("title", "slug", "public", "locked", "posted_time", "edited_time", "summary", "content")
        values (:title, :slug, :public, :locked, :postedTime, :editedTime, :summary, :content)
    """)
    @GetGeneratedKeys
    fun insert(@BindBean post: Post): Long

    /**
     * Update a post by [id] with given [post] data.
     */
    @SqlUpdate("""
        update "post"
        set "title" = :title,
            "public" = :public,
            "locked" = :locked,
            "summary" = :summary,
            "content" = :content,
            "edited_time" = :editedTime
        where "id"=(:id)
    """)
    fun update(@Bind id: Long, @BindBean post: Post)

    /**
     * JDBI row reducer that combines posts, comments and tags into one object.
     */
    class PostWithExtras : LinkedHashMapRowReducer<Long, Post> {
        override fun accumulate(container: MutableMap<Long, Post>, rowView: RowView) {
            val post = container.computeIfAbsent(rowView.getColumn("p_id", Long::class.javaObjectType)) {
                rowView.getRow(Post::class.java)
            }

            if (rowView.getColumn("c_id", Long::class.javaObjectType) != null) {
                rowView.getRow(Comment::class.java).let { comment ->
                    if (post.comments?.none { it.id == comment.id } != false) {
                        post.comments?.add(comment)
                    }
                }
            }

            if (rowView.getColumn("t_id", Long::class.javaObjectType) != null) {
                rowView.getRow(Tag::class.java).let { tag ->
                    if (post.tags?.none { it == tag.name } != false) {
                        post.tags?.add(tag.name)
                    }
                }
            }
        }
    }
}

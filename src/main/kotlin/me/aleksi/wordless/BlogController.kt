package me.aleksi.wordless

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder
import java.time.Instant
import java.util.*

@RestController
class BlogController(private val postDao: PostDao, private val commentDao: CommentDao) {
    val logger: Logger = LoggerFactory.getLogger(BlogController::class.java)

    @GetMapping("/api/posts")
    fun getAllPosts(): List<Post> {
        logger.debug("getAllPosts")
        return postDao.getAllPosts()
    }

    @GetMapping("/api/posts/{id}")
    fun getPost(@PathVariable id: Long): ResponseEntity<Post> {
        logger.debug("getPost(id=$id)")
        return ResponseEntity.of(Optional.ofNullable(postDao.findById(id)))
    }

    @GetMapping("/api/posts/{postId}/comments")
    fun getComments(@PathVariable postId: Long): List<Comment> {
        logger.debug("getComments(postId=$postId)")
        return commentDao.getComments(postId)
    }

    @GetMapping("/api/posts/{postId}/comments/{id}")
    fun getComment(@PathVariable postId: Long, @PathVariable id: Long): ResponseEntity<Comment> {
        logger.debug("getComment(postId=$postId, id=$id)")
        return ResponseEntity.of(Optional.ofNullable(commentDao.getComment(id)))
    }

    @DeleteMapping("/api/posts/{id}")
    fun deletePost(@PathVariable id: Long): ResponseEntity<Unit> {
        logger.debug("deletePost(id=$id)")
        postDao.deleteById(id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/api/posts")
    fun createPost(@RequestBody post: PostRequest): ResponseEntity<Unit> {
        logger.debug("createPost")

        val createdPost = Post(0, post.title, post.title.slugify(), post.public, Instant.now(), null, post.summary, post.content)
        val id = postDao.insert(createdPost)

        val loc = MvcUriComponentsBuilder
                .fromMethodName(javaClass, "getPost", id)
                .buildAndExpand(id)
                .toUri()

        return ResponseEntity.created(loc).build()
    }

    @PostMapping("/api/posts/{postId}/comments")
    fun createComment(@PathVariable postId: Long, @RequestBody comment: CommentRequest): ResponseEntity<Unit> {
        logger.debug("createComment")

        val created = Comment(0, postId, comment.author, Instant.now(), comment.content)
        val id = commentDao.insert(created)

        val loc = MvcUriComponentsBuilder
                .fromMethodName(javaClass, "getComment", postId, id)
                .buildAndExpand(postId, id)
                .toUri()

        return ResponseEntity.created(loc).build()
    }

    @PutMapping("/api/posts/{id}")
    fun updatePost(@PathVariable id: Long, @RequestBody post: PostRequest): ResponseEntity<Unit> {
        logger.debug("updatePost")

        val original = postDao.findById(id) ?: return ResponseEntity.notFound().build()

        val updatedPost = Post(id,
                post.title,
                post.title.slugify(),
                post.public,
                original.postedTime,
                Instant.now(),
                post.summary,
                post.content)
        postDao.update(id, updatedPost)

        return ResponseEntity.noContent().build()
    }
}

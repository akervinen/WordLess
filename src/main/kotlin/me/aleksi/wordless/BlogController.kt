package me.aleksi.wordless

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder
import java.time.Instant
import java.util.*

@RestController
class BlogController(private val postDao: PostDao, private val commentDao: CommentDao) {
    val logger: Logger = LoggerFactory.getLogger(BlogController::class.java)

    @PreAuthorize("permitAll()")
    @GetMapping("/api/posts")
    fun getPosts(@RequestParam query: String?): List<Post> {
        logger.debug("getPosts(query=$query)")
        if (query != null) {
            return postDao.findByWord(query)
        }

        return postDao.getAllPosts()
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/api/posts/{id}")
    fun getPost(@PathVariable id: Long): ResponseEntity<Post> {
        logger.debug("getPost(id=$id)")
        return ResponseEntity.of(Optional.ofNullable(postDao.findById(id)))
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/api/posts/{postId}/comments")
    fun getComments(@PathVariable postId: Long): List<Comment> {
        logger.debug("getComments(postId=$postId)")
        return commentDao.getComments(postId)
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/api/posts/{postId}/comments/{id}")
    fun getComment(@PathVariable postId: Long, @PathVariable id: Long): ResponseEntity<Comment> {
        logger.debug("getComment(postId=$postId, id=$id)")
        return ResponseEntity.of(Optional.ofNullable(commentDao.getComment(id)))
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/api/posts/{id}")
    fun deletePost(@PathVariable id: Long): ResponseEntity<Unit> {
        logger.debug("deletePost(id=$id)")
        postDao.deleteById(id)
        return ResponseEntity.noContent().build()
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/api/posts/{postId}/comments/{id}")
    fun deleteComment(@PathVariable postId: Long, @PathVariable id: Long): ResponseEntity<Unit> {
        logger.debug("deleteComment(postId=$postId, id=$id)")
        commentDao.deleteById(id)
        return ResponseEntity.noContent().build()
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/api/posts")
    fun createPost(@RequestBody post: PostRequest): ResponseEntity<Unit> {
        logger.debug("createPost")

        val createdPost = Post(id = 0,
                               title = post.title,
                               slug = post.title.slugify(),
                               public = post.public,
                               locked = false,
                               postedTime = Instant.now(),
                               editedTime = null,
                               summary = post.summary,
                               content = post.content)
        val id = postDao.insert(createdPost)

        val loc = MvcUriComponentsBuilder
            .fromMethodName(javaClass, "getPost", id)
            .buildAndExpand(id)
            .toUri()

        return ResponseEntity.created(loc).build()
    }

    @PreAuthorize("permitAll()")
    @PostMapping("/api/posts/{postId}/comments")
    fun createComment(@PathVariable postId: Long, @RequestBody comment: CommentRequest): ResponseEntity<Unit> {
        logger.debug("createComment")

        // Make sure post exists and isn't locked
        val post = postDao.findById(postId) ?: return ResponseEntity.notFound().build()
        if (post.locked) return ResponseEntity.status(HttpStatus.FORBIDDEN).build()

        val created = Comment(id = 0,
                              postId = postId,
                              author = comment.author,
                              postedTime = Instant.now(),
                              content = comment.content)
        val id = commentDao.insert(created)

        val loc = MvcUriComponentsBuilder
            .fromMethodName(javaClass, "getComment", postId, id)
            .buildAndExpand(postId, id)
            .toUri()

        return ResponseEntity.created(loc).build()
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/api/posts/{id}")
    fun updatePost(@PathVariable id: Long, @RequestBody post: PostRequest): ResponseEntity<Unit> {
        logger.debug("updatePost")

        val original = postDao.findById(id) ?: return ResponseEntity.notFound().build()

        val updatedPost = Post(id = id,
                               title = post.title,
                               slug = post.title.slugify(),
                               public = post.public,
                               locked = post.locked,
                               postedTime = original.postedTime,
                               editedTime = Instant.now(),
                               summary = post.summary,
                               content = post.content)
        postDao.update(id, updatedPost)

        return ResponseEntity.noContent().build()
    }
}

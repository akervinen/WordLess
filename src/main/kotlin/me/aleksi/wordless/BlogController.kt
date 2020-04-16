package me.aleksi.wordless

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder
import java.time.Instant
import java.util.*

@RestController
class BlogController(private val postDao: PostDao) {
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
}

package me.aleksi.wordless

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.mapTo
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.core.io.ClassPathResource
import org.springframework.core.io.Resource
import org.springframework.util.FileCopyUtils
import java.io.InputStreamReader
import kotlin.text.Charsets.UTF_8

@SpringBootApplication
class WordLessApplication constructor(private val jdbi: Jdbi) : CommandLineRunner {
    override fun run(vararg args: String?) {
        println("Team: Spaghetti Forever")
        println("\tMember: Aleksi Kervinen")

        val createScript = getStringFromResource(ClassPathResource("/db/create.sql"))
        val seedScript = getStringFromResource(ClassPathResource("/db/seed.sql"))

        jdbi.useHandle<Exception> { handle ->
            handle.createScript(createScript).execute()
            handle.createScript(seedScript).execute()

            println(handle.createQuery("""select "id" from "post"""").mapTo<Int>().toList())
            println(handle.createQuery("""select "title" from "post"""").mapTo<String>().toList())
        }
    }

    private fun getStringFromResource(resource: Resource): String? {
        return InputStreamReader(resource.inputStream, UTF_8).use { reader ->
            FileCopyUtils.copyToString(reader)
        }
    }
}

fun main(args: Array<String>) {
    runApplication<WordLessApplication>(*args)
}

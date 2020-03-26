package me.aleksi.wordless

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.mapTo
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.core.io.ClassPathResource

@SpringBootApplication
class WordLessApplication constructor(private val jdbi: Jdbi) : CommandLineRunner {
    override fun run(vararg args: String?) {
        println("Team: Spaghetti Forever\n\tMember: Aleksi Kervinen")

        val createScript = ClassPathResource("db/create.sql").file.readText()
        val seedScript = ClassPathResource("db/seed.sql").file.readText()

        jdbi.useHandle<Exception> { handle ->
            handle.createScript(createScript).execute()
            handle.createScript(seedScript).execute()

            println(handle.createQuery("""select "id" from "post"""").mapTo<Int>().toList())
            println(handle.createQuery("""select "title" from "post"""").mapTo<String>().toList())
        }
    }
}

fun main(args: Array<String>) {
    runApplication<WordLessApplication>(*args)
}

package me.aleksi.wordless

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.spring4.JdbiFactoryBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jdbc.datasource.TransactionAwareDataSourceProxy
import javax.sql.DataSource

/**
 * Configures JDBI settings, namely AutoInstallPlugins.
 */
@Configuration
class JdbiConfiguration {
    /**
     * Enables AutoInstallPlugins for JDBI.
     */
    @Bean
    fun getJdbiFactoryBean(dataSource: DataSource): JdbiFactoryBean {
        val jfb = JdbiFactoryBean(TransactionAwareDataSourceProxy(dataSource))
        jfb.setAutoInstallPlugins(true)
        return jfb
    }

    /**
     * Creates a [SettingsDao].
     */
    @Bean
    fun settingsDao(jdbi: Jdbi): SettingsDao {
        return jdbi.onDemand(SettingsDao::class.java)
    }

    /**
     * Creates a [PostDao].
     */
    @Bean
    fun postDao(jdbi: Jdbi): PostDao {
        return jdbi.onDemand(PostDao::class.java)
    }

    /**
     * Creates a [CommentDao].
     */
    @Bean
    fun commentDao(jdbi: Jdbi): CommentDao {
        return jdbi.onDemand(CommentDao::class.java)
    }

    /**
     * Creates a [TagDao].
     */
    @Bean
    fun tagDao(jdbi: Jdbi): TagDao {
        return jdbi.onDemand(TagDao::class.java)
    }
}

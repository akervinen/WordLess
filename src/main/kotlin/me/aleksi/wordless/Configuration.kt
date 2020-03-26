package me.aleksi.wordless

import org.jdbi.v3.spring4.JdbiFactoryBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import javax.sql.DataSource

@Configuration
class Configuration {
    @Bean
    fun getJdbiFactoryBean(dataSource: DataSource): JdbiFactoryBean {
        val jfb = JdbiFactoryBean(dataSource)
        jfb.setAutoInstallPlugins(true)
        return jfb
    }
}

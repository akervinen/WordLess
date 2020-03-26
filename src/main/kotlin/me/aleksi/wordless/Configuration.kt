package me.aleksi.wordless

import org.jdbi.v3.spring4.JdbiFactoryBean
import org.springframework.boot.web.server.ConfigurableWebServerFactory
import org.springframework.boot.web.server.ErrorPage
import org.springframework.boot.web.server.WebServerFactoryCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus
import org.springframework.jdbc.datasource.TransactionAwareDataSourceProxy
import javax.sql.DataSource

@Configuration
class Configuration {
    @Bean
    fun getJdbiFactoryBean(dataSource: DataSource): JdbiFactoryBean {
        val jfb = JdbiFactoryBean(TransactionAwareDataSourceProxy(dataSource))
        jfb.setAutoInstallPlugins(true)
        return jfb
    }

    @Bean
    fun notFoundCustomizer(): WebServerFactoryCustomizer<ConfigurableWebServerFactory> {
        return WebServerFactoryCustomizer<ConfigurableWebServerFactory> { factory ->
            factory?.addErrorPages(ErrorPage(HttpStatus.NOT_FOUND, "/"))
        }
    }
}

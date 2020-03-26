-- noinspection SqlResolveForFile @ object-type/"serial"

drop table if exists post;

create table if not exists post
(
    id          serial,
    title       varchar(200) not null,
    slug        varchar(100) not null,
    public      boolean      not null,
    posted_time timestamp    not null,
    edited_time timestamp,
    summary     text         not null,
    content     text         not null,
    constraint POST_PK
        primary key (id)
);

create index post_posted_time on post (posted_time);

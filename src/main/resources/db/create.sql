-- noinspection SqlResolveForFile @ object-type/"serial"

drop table if exists "post_tags";
drop table if exists "tag";
drop table if exists "comment";
drop table if exists "post";

create table if not exists "post"
(
    id          serial,
    title       varchar(200) not null,
    slug        varchar(100) not null,
    public      boolean      not null default true,
    locked      boolean      not null default false,
    posted_time timestamp    not null default NOW(),
    edited_time timestamp,
    summary     text         not null,
    content     text         not null,
    primary key (id)
);

create index post_posted_time on "post" (posted_time);

create table if not exists "comment"
(
    id          serial,
    post_id     serial,
    author      varchar(100) not null,
    posted_time timestamp    not null default NOW(),
    content     text         not null,
    primary key (id),
    foreign key (post_id) references "post" (id) on delete cascade
);

create index comment_post_id on "comment" (post_id);
create index comment_posted_time on "comment" (posted_time);

create table if not exists "tag"
(
    id   serial,
    name varchar(50) not null unique,
    primary key (id)
);

create table if not exists "post_tags"
(
    post_id serial,
    tag_id  serial,
    primary key (post_id, tag_id)
);

create index post_tags_reverse on "post_tags" (tag_id, post_id);

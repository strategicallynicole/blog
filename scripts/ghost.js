const ghostContentAPI = require("@tryghost/content-api");
hexo.extend.generator.register('post', function(locals) {
    return locals.posts.map(function(post) {
        return {
            path: post.path,
            data: post,
            layout: 'post'
        };
    });
});

const api = new ghostContentAPI({
    url: "https://demo.ghost.io",
    key: "22444f78447824223cefc48062",
    version: "v3"
});

const ghostPostData = async() => {
    const data = await api.posts
        .browse({
            include: "tags,authors",
            limit: "all"
        })
        .catch(err => {
            console.error(err);
        });

    data.forEach(post => {
        const postData = {
            title: post.title,
            slug: post.slug,
            path: post.slug,
            date: post.published_at,
            content: post.html,
            author: {
                name: post.primary_author.name,
                slug: `/author/${post.primary_author.slug}`,
            },
            tags: post.tags
                .map(tag => {
                    return tag.name;
                })
                .join(", ")
        }

        hexo.post.create(postData, true);
    });
};
const ghostPages = async() => {

    // Get all pages
    const data = await api.pages
        .browse({
            limit: "all"
        })
        .catch(err => {
            console.error(err);
        });

    data.forEach(page => {
        hexo.extend.generator.register(page.slug, function(locals) {
            return {
                path: `${page.slug}/index.html`,
                data: { title: page.title, content: page.html },
                layout: ["page", "index"]
            };
        });
    });
};
const ghostAuthors = async() => {

    // Get all post authors
    const data = await api.authors
        .browse({
            limit: "all"
        })
        .catch(err => {
            console.error(err);
        });

    data.forEach(author => {
        hexo.extend.generator.register(author.slug, function(locals) {
            return {

                // Set an author path to prevent URL collisions
                path: `/author/${author.slug}/index.html`,
                data: {
                    title: author.name,
                    content: `<p>${author.bio}</p>`
                },
                layout: ["author", "index"]
            };
        });
    });
};

ghostAuthors();
ghostPages();
ghostPostData();
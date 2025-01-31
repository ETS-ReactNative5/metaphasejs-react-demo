export const sampleCode = `
// Users -----------------------------------------------------------------
const users = new Collection(User);
const user1 = new User({name: "user1", age: 11, admin: 1});
const user2 = new User({name: "user2", age: 22, admin: 1});
const user3 = new User({name: "user3", age: 33, admin: 1});
users.save(user1);
users.save(user2);
users.save(user3);

// Posts -----------------------------------------------------------------
const posts = new Collection(Post);
const post1 = new Post({title: 'title post 1', content: 'content post 1'});
const post2 = new Post({title: 'title post 2', content: 'content post 2'});
const post3 = new Post({title: 'title post 3', content: 'content post 3'});
post1.belongsTo(user1);
post2.belongsTo(user1);
post3.belongsTo(user2);
posts.save(post1);
posts.save(post2);
posts.save(post3);

// Comments -----------------------------------------------------------------
const comments = new Collection(Comment);
const comment1 = new Comment({author: 'author1', date: 'date1'});
const comment2 = new Comment({author: 'author2', date: 'date2'});
comment1.belongsTo(post1);
comment2.belongsTo(post1);
comment1.save();
comment2.save();

`;
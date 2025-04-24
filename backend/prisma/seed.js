const { PrismaClient, UserRole, StoryStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('Start seeding...');

  // Clean up existing data
  await prisma.bookmark.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.categoryOnStory.deleteMany();
  await prisma.story.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
      bio: 'System administrator for the story reading platform.'
    }
  });

  const authorPassword = await hashPassword('author123');
  const author1 = await prisma.user.create({
    data: {
      username: 'janeausten',
      email: 'jane@example.com',
      password: authorPassword,
      role: UserRole.USER,
      profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
      bio: 'Classic literature author with a passion for romance and social commentary.'
    }
  });

  const author2 = await prisma.user.create({
    data: {
      username: 'marktwain',
      email: 'mark@example.com',
      password: authorPassword,
      role: UserRole.USER,
      profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg',
      bio: 'American writer, humorist, and lecturer.'
    }
  });

  const readerPassword = await hashPassword('reader123');
  const reader1 = await prisma.user.create({
    data: {
      username: 'bookworm',
      email: 'reader1@example.com',
      password: readerPassword,
      role: UserRole.USER,
      profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg',
      bio: 'Avid reader who enjoys all genres, especially fantasy and mystery.'
    }
  });

  const reader2 = await prisma.user.create({
    data: {
      username: 'nightowl',
      email: 'reader2@example.com',
      password: readerPassword,
      role: UserRole.USER,
      profilePicture: 'https://randomuser.me/api/portraits/men/5.jpg',
      bio: 'I read mostly at night, hence the username. Big fan of sci-fi and horror.'
    }
  });

  // Create categories
  const fantasy = await prisma.category.create({
    data: {
      name: 'Fantasy',
      description: 'Stories that contain elements of magic or the supernatural'
    }
  });

  const romance = await prisma.category.create({
    data: {
      name: 'Romance',
      description: 'Stories centered around romantic relationships'
    }
  });

  const mystery = await prisma.category.create({
    data: {
      name: 'Mystery',
      description: 'Stories involving puzzles, secrets, and suspense'
    }
  });

  const scifi = await prisma.category.create({
    data: {
      name: 'Science Fiction',
      description: 'Stories based on scientific or technological advances'
    }
  });

  const historical = await prisma.category.create({
    data: {
      name: 'Historical Fiction',
      description: 'Stories set in the past that blend historical facts with fiction'
    }
  });

  // Create stories
  const prideAndPrejudice = await prisma.story.create({
    data: {
      title: 'Pride and Prejudice',
      description: 'A classic tale of manners, upbringing, morality, education, and marriage in early 19th-century England.',
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000',
      status: StoryStatus.COMPLETED,
      viewCount: 1250,
      authorId: author1.id
    }
  });

  const senseAndSensibility = await prisma.story.create({
    data: {
      title: 'Sense and Sensibility',
      description: 'The story of the Dashwood sisters as they navigate love, romance, and heartbreak.',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000',
      status: StoryStatus.COMPLETED,
      viewCount: 980,
      authorId: author1.id
    }
  });

  const tomSawyer = await prisma.story.create({
    data: {
      title: 'The Adventures of Tom Sawyer',
      description: 'The story of a young boy growing up along the Mississippi River.',
      coverImage: 'https://images.unsplash.com/photo-1518744386442-2d48ac47a7eb?q=80&w=1000',
      status: StoryStatus.COMPLETED,
      viewCount: 1100,
      authorId: author2.id
    }
  });

  const huckFinn = await prisma.story.create({
    data: {
      title: 'Adventures of Huckleberry Finn',
      description: 'A sequel to Tom Sawyer, this story follows Huck Finn and his friend Jim, an escaped slave.',
      coverImage: 'https://images.unsplash.com/photo-1528459105426-b9548367069b?q=80&w=1000',
      status: StoryStatus.COMPLETED,
      viewCount: 1050,
      authorId: author2.id
    }
  });

  const mysteryNovel = await prisma.story.create({
    data: {
      title: 'The Midnight Mystery',
      description: 'A thrilling mystery set in a small town where strange disappearances have been occurring.',
      coverImage: 'https://images.unsplash.com/photo-1587876931567-564ce588bfbd?q=80&w=1000',
      status: StoryStatus.PUBLISHED,
      viewCount: 450,
      authorId: author2.id
    }
  });

  // Connect stories to categories
  await prisma.categoryOnStory.createMany({
    data: [
      { storyId: prideAndPrejudice.id, categoryId: romance.id },
      { storyId: prideAndPrejudice.id, categoryId: historical.id },
      { storyId: senseAndSensibility.id, categoryId: romance.id },
      { storyId: senseAndSensibility.id, categoryId: historical.id },
      { storyId: tomSawyer.id, categoryId: historical.id },
      { storyId: huckFinn.id, categoryId: historical.id },
      { storyId: mysteryNovel.id, categoryId: mystery.id }
    ]
  });

  // Create chapters
  await prisma.chapter.create({
    data: {
      title: 'Chapter 1: A New Beginning',
      content: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.',
      chapterNumber: 1,
      wordCount: 63,
      storyId: prideAndPrejudice.id
    }
  });

  await prisma.chapter.create({
    data: {
      title: 'Chapter 2: The Bennet Family',
      content: 'Mr. Bennet was so odd a mixture of quick parts, sarcastic humour, reserve, and caprice, that the experience of three-and-twenty years had been insufficient to make his wife understand his character. Her mind was less difficult to develop. She was a woman of mean understanding, little information, and uncertain temper.',
      chapterNumber: 2,
      wordCount: 52,
      storyId: prideAndPrejudice.id
    }
  });

  await prisma.chapter.create({
    data: {
      title: 'Chapter 1: The Dashwood Family',
      content: 'The family of Dashwood had long been settled in Sussex. Their estate was large, and their residence was at Norland Park, in the centre of their property, where, for many generations, they had lived in so respectable a manner as to engage the general good opinion of their surrounding acquaintance.',
      chapterNumber: 1,
      wordCount: 55,
      storyId: senseAndSensibility.id
    }
  });

  await prisma.chapter.create({
    data: {
      title: 'Chapter 1: Tom and Aunt Polly',
      content: 'TOM! No answer. TOM! No answer. What\'s gone with that boy, I wonder? You TOM! No answer. The old lady pulled her spectacles down and looked over them about the room; then she put them up and looked out under them.',
      chapterNumber: 1,
      wordCount: 42,
      storyId: tomSawyer.id
    }
  });

  await prisma.chapter.create({
    data: {
      title: 'Chapter 1: I Discover Moses and the Bulrushers',
      content: 'You don\'t know about me without you have read a book by the name of The Adventures of Tom Sawyer; but that ain\'t no matter. That book was made by Mr. Mark Twain, and he told the truth, mainly. There was things which he stretched, but mainly he told the truth.',
      chapterNumber: 1,
      wordCount: 56,
      storyId: huckFinn.id
    }
  });

  await prisma.chapter.create({
    data: {
      title: 'Chapter 1: The Disappearance',
      content: 'The small town of Millfield had never seen anything like it. Three people vanished without a trace in the span of a week. No evidence, no witnesses, nothing but empty homes and concerned families left behind.',
      chapterNumber: 1,
      wordCount: 38,
      storyId: mysteryNovel.id
    }
  });

  // Create comments
  await prisma.comment.create({
    data: {
      content: 'This is one of my all-time favorite books!',
      userId: reader1.id,
      storyId: prideAndPrejudice.id
    }
  });

  await prisma.comment.create({
    data: {
      content: 'The character development in this story is amazing.',
      userId: reader2.id,
      storyId: prideAndPrejudice.id
    }
  });

  // Helper function to safely get chapter ID
  async function getChapterId(storyId, chapterNumber) {
    const chapter = await prisma.chapter.findFirst({ 
      where: { 
        storyId: storyId, 
        chapterNumber: chapterNumber 
      } 
    });
    return chapter ? chapter.id : null;
  }

  // Create chapter comment
  const prideCh1 = await getChapterId(prideAndPrejudice.id, 1);
  await prisma.comment.create({
    data: {
      content: 'I love the first chapter, it sets the tone perfectly.',
      userId: reader1.id,
      chapterId: prideCh1
    }
  });

  await prisma.comment.create({
    data: {
      content: 'Tom Sawyer is such a mischievous character!',
      userId: reader2.id,
      storyId: tomSawyer.id
    }
  });

  // Create ratings
  await prisma.rating.create({
    data: {
      rating: 5,
      userId: reader1.id,
      storyId: prideAndPrejudice.id
    }
  });

  await prisma.rating.create({
    data: {
      rating: 4,
      userId: reader2.id,
      storyId: prideAndPrejudice.id
    }
  });

  await prisma.rating.create({
    data: {
      rating: 5,
      userId: reader1.id,
      storyId: tomSawyer.id
    }
  });

  await prisma.rating.create({
    data: {
      rating: 3,
      userId: reader2.id,
      storyId: senseAndSensibility.id
    }
  });

  // Create bookmarks
  const prideCh2 = await getChapterId(prideAndPrejudice.id, 2);
  await prisma.bookmark.create({
    data: {
      userId: reader1.id,
      storyId: prideAndPrejudice.id,
      chapterId: prideCh2
    }
  });

  const tomCh1 = await getChapterId(tomSawyer.id, 1);
  await prisma.bookmark.create({
    data: {
      userId: reader2.id,
      storyId: tomSawyer.id,
      chapterId: tomCh1
    }
  });

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

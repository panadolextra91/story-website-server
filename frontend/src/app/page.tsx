import Image from "next/image";
import Link from "next/link";

export default function Home() {
  // Sample featured stories data
  const featuredStories = [
    {
      id: 1,
      title: "Thượng Lan Chu",
      coverImage: "/images/cover1.jpg",
      description: "Năm ấy mười sáu tuổi, ta rơi xuống nước và buộc phải gả cho thế tử phủ Quốc công. Từ đó trở thành...",
      author: "Mưa Rào Tháng Sáu"
    },
    {
      id: 2,
      title: "Vả Mặt Thái Tử",
      coverImage: "/images/cover2.jpg",
      description: "Thái Tử đem lòng yêu cô gái câm đã từng cứu hắn và nhất quyết muốn từ hôn với ta...",
      author: "Nhóc Miko"
    },
    {
      id: 3,
      title: "Vợ Mới Vợ Cũ",
      coverImage: "/images/cover3.jpg",
      description: "Nữ chính tự kết thúc cuộc đời mình trong một căn phòng lạnh lẽo, nơi không còn ai chờ đợi, không...",
      author: "Cần 1 ly cafe mỗi ngày"
    },
    {
      id: 4,
      title: "Tiểu sư muội nói Thần kinh cũng là Thần",
      coverImage: "/images/cover4.jpg",
      description: "Tên truyện: Tiểu sư muội nói Thần kinh cũng là Thần. Tên gốc: 小师妹说神经也是神 Tác...",
      author: "Thu Vũ Miên Miên"
    },
  ];

  // Sample hot stories data
  const hotStories = [
    {
      id: 1,
      title: "Những Bức Thư Tình",
      views: "249,531",
      chapters: 52,
    },
    {
      id: 2,
      title: "San Phẳng Núi Non",
      views: "141,122",
      chapters: 32,
    },
    {
      id: 3,
      title: "Sau Khi Hòa Ly, Phu Quân Hối Hận Rồi",
      views: "103,487",
      chapters: 8,
    },
  ];

  // Sample categories
  const categories = [
    "Ngôn Tình", "Cổ Đại", "Hiện Đại", "Xuyên Không", "Trọng Sinh", 
    "Huyền Huyễn", "HE", "Ngược", "Sủng", "Cung Đấu", "Đam Mỹ"
  ];

  // Top authors
  const topAuthors = [
    { id: 1, name: "Diệp Gia Gia", stories: 354872 },
    { id: 2, name: "Xoăn dịch truyện", stories: 468753 },
    { id: 3, name: "Lộn Xộn page", stories: 342109 },
    { id: 4, name: "Đồng Đồng", stories: 253545 },
    { id: 5, name: "Hạt Dẻ Rang Đường", stories: 242680 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">StoryReading</Link>
            </div>
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="hover:text-blue-600 font-medium">Trang chủ</Link>
              <Link href="/stories" className="hover:text-blue-600 font-medium">Truyện mới</Link>
              <div className="relative group">
                <button className="hover:text-blue-600 font-medium flex items-center">
                  Thể loại
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  {categories.slice(0, 5).map((category, index) => (
                    <Link key={index} href={`/category/${category}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{category}</Link>
                  ))}
                </div>
              </div>
              <Link href="/completed" className="hover:text-blue-600 font-medium">Truyện Full</Link>
              <Link href="/longform" className="hover:text-blue-600 font-medium">Truyện Dài</Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm truyện..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link href="/login" className="py-2 px-4 text-sm font-medium text-blue-600 hover:text-blue-800">Đăng nhập</Link>
                <Link href="/register" className="py-2 px-4 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700">Đăng ký</Link>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Featured Stories Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Đề cử hôm nay</h2>
            <Link href="/recommended" className="text-blue-600 hover:underline text-sm">Xem thêm</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStories.map((story) => (
              <div key={story.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-60 w-full">
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Cover Image</span>
                  </div>
                  {/* Uncomment when you have real images */}
                  {/* <Image 
                    src={story.coverImage}
                    alt={story.title}
                    fill
                    className="object-cover"
                  /> */}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{story.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{story.description}</p>
                  <p className="text-gray-500 text-xs">Tác giả: {story.author}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hot Stories Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Truyện Hot Tháng Này</h2>
            <Link href="/hot" className="text-blue-600 hover:underline text-sm">Xem thêm</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hotStories.map((story) => (
              <div key={story.id} className="bg-white rounded-lg shadow-md p-4 flex items-center">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                  {story.id}
                </div>
                <div>
                  <Link href={`/story/${story.id}`} className="font-bold hover:text-blue-600">{story.title}</Link>
                  <div className="flex text-sm text-gray-500 mt-1">
                    <span className="mr-4">{story.views} lượt đọc</span>
                    <span>{story.chapters} chương</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Two Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6">Thể Loại</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <Link 
                  key={index} 
                  href={`/category/${category}`}
                  className="bg-white shadow-sm rounded-md p-3 text-center hover:shadow-md hover:text-blue-600 transition-all"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>

          {/* Top Authors */}
          <div>
            <h2 className="text-xl font-bold mb-6">Tác Giả Nổi Bật</h2>
            <div className="bg-white rounded-lg shadow-md">
              {topAuthors.map((author, index) => (
                <Link 
                  key={author.id} 
                  href={`/author/${author.id}`}
                  className={`flex items-center p-4 ${index !== topAuthors.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50`}
                >
                  <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <span className={`font-bold ${index < 3 ? 'text-blue-600' : 'text-gray-500'}`}>{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{author.name}</h3>
                    <p className="text-xs text-gray-500">{author.stories.toLocaleString()} lượt đọc</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <Link href="/" className="text-xl font-bold text-blue-600">StoryReading</Link>
            <p className="text-gray-500 mt-2">Chuyên cập nhật các truyện tiểu thuyết, ngôn tình, truyện ngắn hot nhất 2024</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Link href="/about" className="text-gray-600 hover:text-blue-600">Giới thiệu</Link>
            <Link href="/terms" className="text-gray-600 hover:text-blue-600">Điều khoản sử dụng</Link>
            <Link href="/privacy" className="text-gray-600 hover:text-blue-600">Chính sách bảo mật</Link>
            <Link href="/dmca" className="text-gray-600 hover:text-blue-600">DMCA</Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600">Liên hệ</Link>
          </div>
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} StoryReading. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

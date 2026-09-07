import { Link } from "react-router-dom";

interface NewsItem {
  id: number;
  image: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
}

function News() {
  const news: NewsItem[] = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
      category: "استثمار",
      date: "02 سبتمبر 2026",
      title: "تعزيز فرص الاستثمار ودعم المشاريع الجديدة",
      excerpt:
        "جهود متواصلة لتوفير بيئة استثمارية مناسبة وتشجيع المستثمرين على تطوير مشاريعهم.",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
      category: "اقتصاد",
      date: "28 أوت 2026",
      title: "لقاءات جديدة لدعم المستثمرين وأصحاب المشاريع",
      excerpt:
        "تنظيم لقاءات وفعاليات تهدف إلى التعريف بالإمكانات الاستثمارية ومرافقة المستثمرين.",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
      category: "أخبار الوكالة",
      date: "20 أوت 2026",
      title: "تطوير الخدمات الرقمية لفائدة المستثمر",
      excerpt:
        "حلول رقمية جديدة لتسهيل الوصول إلى المعلومات والخدمات المتعلقة بالاستثمار.",
    },
  ];

  return (
    <section className="news-section">
      <div className="container">

        <div className="news-header">
          <div>
            <span className="section-overline">
              آخر المستجدات
            </span>

            <h2>
              أخبار
              <strong> الاستثمار</strong>
            </h2>
          </div>

          <div className="news-header-right">
            <p>
              تابع آخر الأخبار والمستجدات المتعلقة بالاستثمار
              والمشاريع والاقتصاد الوطني.
            </p>

            <Link
              to="/news"
              className="news-all-link"
            >
              <span>جميع الأخبار</span>
              <i className="bi bi-arrow-left"></i>
            </Link>
          </div>
        </div>

        <div className="row g-4">
          {news.map((item) => (
            <div
              className="col-xl-4 col-lg-4 col-md-6"
              key={item.id}
            >
              <article className="news-card">

                <Link
                  to={`/news/${item.id}`}
                  className="news-image-link"
                >
                  <div className="news-image-wrapper">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="news-image"
                    />

                    <div className="news-image-overlay"></div>

                    <span className="news-category">
                      {item.category}
                    </span>

                    <span className="news-date">
                      {item.date}
                    </span>
                  </div>
                </Link>

                <div className="news-content">

                  <div className="news-meta">
                    <i className="bi bi-calendar3"></i>
                    <span>{item.date}</span>
                  </div>

                  <h3>
                    <Link to={`/news/${item.id}`}>
                      {item.title}
                    </Link>
                  </h3>

                  <p>{item.excerpt}</p>

                  <Link
                    to={`/news/${item.id}`}
                    className="news-read-more"
                  >
                    <span>اقرأ المزيد</span>
                    <i className="bi bi-arrow-left"></i>
                  </Link>

                </div>
              </article>
            </div>
          ))}
        </div>

        <div className="news-bottom">
          <Link
            to="/news"
            className="green-outline-button"
          >
            <span>اكتشف جميع الأخبار</span>
            <i className="bi bi-arrow-left"></i>
          </Link>
        </div>

      </div>
    </section>
  );
}

export default News;
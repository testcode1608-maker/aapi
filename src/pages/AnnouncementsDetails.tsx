import { Link, useParams } from "react-router-dom";

type Announcement = {
  id: number;
  title: string;
  category: string;
  date: string;
  important?: boolean;
  excerpt: string;
  content: string[];
};

const announcements: Announcement[] = [
  {
    id: 1,
    title: "فتح باب استقبال طلبات الاستفادة من فرص الاستثمار",
    category: "إعلانات المستثمرين",
    date: "02 سبتمبر 2026",
    important: true,
    excerpt:
      "إعلان لفائدة المستثمرين الراغبين في الاطلاع على الفرص الاستثمارية المتاحة.",
    content: [
      "تعلن الوكالة عن فتح باب استقبال طلبات المستثمرين الراغبين في الاستفادة من المعلومات المتعلقة بفرص الاستثمار المتاحة.",
      "يمكن للمستثمرين الاطلاع على المشاريع والفرص حسب القطاعات والنشاطات الاقتصادية المختلفة.",
      "يتم استقبال الطلبات ودراستها وفق الإجراءات المعمول بها.",
    ],
  },
  {
    id: 2,
    title:
      "إعلان عن تحديث بعض الإجراءات المتعلقة بالمشاريع الاستثمارية",
    category: "إعلانات عامة",
    date: "30 أوت 2026",
    important: true,
    excerpt:
      "تحديث المعلومات المتعلقة بمراحل تسجيل ومتابعة المشاريع الاستثمارية.",
    content: [
      "تم تحديث المعلومات الخاصة ببعض الإجراءات المرتبطة بالمشاريع الاستثمارية.",
      "ينصح المستثمرون بالاطلاع على آخر المعلومات قبل إيداع ملفاتهم.",
      "تهدف هذه التحديثات إلى تحسين وضوح المسار الاستثماري وتسهيل الإجراءات.",
    ],
  },
  {
    id: 3,
    title: "دعوة للمشاركة في لقاء حول فرص الاستثمار",
    category: "مواعيد",
    date: "27 أوت 2026",
    excerpt:
      "لقاء إعلامي موجه للمستثمرين حول الفرص المتاحة وآليات المرافقة.",
    content: [
      "تنظم الوكالة لقاءً إعلاميًا لفائدة المستثمرين والمتعاملين الاقتصاديين.",
      "يتناول اللقاء مختلف فرص الاستثمار وآليات المرافقة المتاحة للمستثمر.",
      "يمكن للراغبين في المشاركة متابعة الإعلانات الرسمية الخاصة باللقاء.",
    ],
  },
  {
    id: 4,
    title: "عرض مشاريع استثمارية جديدة في عدة قطاعات",
    category: "طلبات وعروض",
    date: "24 أوت 2026",
    excerpt:
      "مجموعة من الفرص والمشاريع الاستثمارية المقترحة أمام المستثمرين.",
    content: [
      "تم عرض مجموعة من المشاريع الاستثمارية الجديدة في عدة قطاعات اقتصادية.",
      "تتوفر معلومات أولية حول طبيعة المشاريع ومواقعها ومجالات نشاطها.",
      "يمكن للمستثمرين المهتمين التواصل مع المصالح المختصة للحصول على مزيد من المعلومات.",
    ],
  },
  {
    id: 5,
    title: "إعلان لفائدة حاملي المشاريع الاستثمارية",
    category: "إعلانات المستثمرين",
    date: "20 أوت 2026",
    excerpt:
      "معلومات وتوجيهات جديدة لفائدة حاملي المشاريع الراغبين في الاستثمار.",
    content: [
      "يخص هذا الإعلان حاملي المشاريع الاستثمارية الراغبين في إطلاق مشاريع جديدة.",
      "يمكن الاستفادة من خدمات المرافقة والتوجيه للحصول على المعلومات اللازمة.",
      "ندعو حاملي المشاريع إلى تحضير ملفاتهم والاطلاع على مختلف مراحل المسار الاستثماري.",
    ],
  },
  {
    id: 6,
    title: "إطلاق خدمة معلوماتية جديدة للمستثمرين",
    category: "إعلانات عامة",
    date: "16 أوت 2026",
    excerpt:
      "خدمة جديدة تهدف إلى تسهيل الوصول إلى المعلومات الاستثمارية.",
    content: [
      "تم إطلاق خدمة معلوماتية جديدة تهدف إلى تحسين تجربة المستثمر.",
      "توفر الخدمة إمكانية الوصول بشكل أسرع إلى المعلومات الأساسية المتعلقة بالاستثمار.",
      "سيتم تطوير الخدمة وإثراؤها تدريجيًا بإمكانيات إضافية.",
    ],
  },
  {
    id: 7,
    title: "إعلان حول آجال إيداع بعض الملفات",
    category: "مواعيد",
    date: "12 أوت 2026",
    excerpt:
      "تذكير بالمواعيد والآجال المتعلقة بإيداع بعض الملفات والطلبات.",
    content: [
      "تذكر الوكالة المستثمرين بضرورة احترام الآجال المحددة لإيداع الملفات.",
      "ينصح بالتأكد من استكمال الوثائق المطلوبة قبل إيداع أي ملف.",
      "للاستفسارات يمكن استعمال قنوات الاتصال المتاحة عبر الموقع.",
    ],
  },
  {
    id: 8,
    title: "دعوة للاطلاع على الفرص الاستثمارية حسب القطاعات",
    category: "طلبات وعروض",
    date: "08 أوت 2026",
    excerpt:
      "اكتشف مجموعة من القطاعات والفرص الاستثمارية المتاحة.",
    content: [
      "تدعو الوكالة المستثمرين إلى الاطلاع على الفرص الاستثمارية المصنفة حسب القطاعات.",
      "تشمل الفرص مجالات اقتصادية متعددة يمكن للمستثمرين دراستها وفق احتياجاتهم.",
      "للمزيد من المعلومات يمكن الانتقال إلى فضاء فرص الاستثمار.",
    ],
  },
];

function AnnouncementsDetails() {
  const { id } = useParams<{ id: string }>();

  const announcementId = Number(id);

  const announcement = announcements.find(
    (item) => item.id === announcementId
  );

  if (!announcement) {
    return (
      <section className="announcement-details-not-found">
        <div className="container">
          <div className="announcement-not-found-card">
            <div className="announcement-not-found-icon">
              <i
                className="bi bi-exclamation-circle"
                aria-hidden="true"
              ></i>
            </div>

            <h1>الإعلان غير موجود</h1>

            <p>
              عذرًا، لم نتمكن من العثور على الإعلان الذي تبحث عنه.
            </p>

            <Link
              to="/announcements"
              className="btn aapi-btn-primary"
            >
              <i
                className="bi bi-arrow-right"
                aria-hidden="true"
              ></i>

              العودة إلى الإعلانات
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="announcement-details-hero">
        <div className="container">
          <div className="announcement-details-hero-content">
            <span>الإعلانات</span>

            <h1>تفاصيل الإعلان</h1>

            <div className="announcement-details-breadcrumb">
              <Link to="/">الرئيسية</Link>

              <i
                className="bi bi-chevron-left"
                aria-hidden="true"
              ></i>

              <Link to="/announcements">
                الإعلانات
              </Link>

              <i
                className="bi bi-chevron-left"
                aria-hidden="true"
              ></i>

              <strong>التفاصيل</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          ARTICLE
          ============================================================ */}
      <section className="announcement-details-section">
        <div className="container">
          <div className="row g-4 g-lg-5">
            {/* MAIN CONTENT */}
            <div className="col-lg-8">
              <article className="announcement-details-article">
                <div className="announcement-details-top">
                  <div className="announcement-details-category">
                    <i
                      className="bi bi-folder2-open"
                      aria-hidden="true"
                    ></i>

                    {announcement.category}
                  </div>

                  {announcement.important && (
                    <div className="announcement-details-important">
                      <i
                        className="bi bi-star-fill"
                        aria-hidden="true"
                      ></i>

                      إعلان مهم
                    </div>
                  )}
                </div>

                <h2>{announcement.title}</h2>

                <div className="announcement-details-date">
                  <i
                    className="bi bi-calendar3"
                    aria-hidden="true"
                  ></i>

                  <span>{announcement.date}</span>
                </div>

                <div className="announcement-details-divider"></div>

                <div className="announcement-details-intro">
                  {announcement.excerpt}
                </div>

                <div className="announcement-details-content">
                  {announcement.content.map(
                    (paragraph, index) => (
                      <p
                        key={`${announcement.id}-${index}`}
                      >
                        {paragraph}
                      </p>
                    )
                  )}
                </div>

                {/* ACTIONS */}
                <div className="announcement-details-actions">
                  <Link
                    to="/announcements"
                    className="announcement-back-button"
                  >
                    <i
                      className="bi bi-arrow-right"
                      aria-hidden="true"
                    ></i>

                    العودة إلى قائمة الإعلانات
                  </Link>

                  <button
                    type="button"
                    className="announcement-print-button"
                    onClick={() => window.print()}
                  >
                    <i
                      className="bi bi-printer"
                      aria-hidden="true"
                    ></i>

                    طباعة الإعلان
                  </button>
                </div>
              </article>
            </div>

            {/* SIDEBAR */}
            <div className="col-lg-4">
              <aside className="announcement-details-sidebar">
                {/* ANNOUNCEMENTS */}
                <div className="announcement-sidebar-card">
                  <div className="announcement-sidebar-icon">
                    <i
                      className="bi bi-megaphone"
                      aria-hidden="true"
                    ></i>
                  </div>

                  <h3>الإعلانات</h3>

                  <p>
                    تابع آخر الإعلانات والمعلومات المتعلقة
                    بالمستثمرين والمشاريع الاستثمارية.
                  </p>

                  <Link to="/announcements">
                    جميع الإعلانات

                    <i
                      className="bi bi-arrow-left"
                      aria-hidden="true"
                    ></i>
                  </Link>
                </div>

                {/* OPPORTUNITIES */}
                <div className="announcement-sidebar-card green">
                  <div className="announcement-sidebar-icon">
                    <i
                      className="bi bi-lightbulb"
                      aria-hidden="true"
                    ></i>
                  </div>

                  <h3>فرص الاستثمار</h3>

                  <p>
                    اكتشف الفرص الاستثمارية المتاحة حسب القطاعات
                    والمجالات الاقتصادية.
                  </p>

                  <Link to="/opportunities">
                    اكتشف الفرص

                    <i
                      className="bi bi-arrow-left"
                      aria-hidden="true"
                    ></i>
                  </Link>
                </div>

                {/* CONTACT */}
                <div className="announcement-sidebar-contact">
                  <i
                    className="bi bi-headset"
                    aria-hidden="true"
                  ></i>

                  <div>
                    <strong>
                      هل تحتاج إلى مساعدة؟
                    </strong>

                    <span>
                      تواصل معنا للحصول على المزيد من المعلومات.
                    </span>
                  </div>

                  <Link to="/contact">
                    اتصل بنا
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default AnnouncementsDetails;
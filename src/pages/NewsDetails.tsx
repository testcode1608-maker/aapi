import { Link, useParams } from "react-router-dom";

type NewsDetailsItem = {
  id: number;
  title: string;
  category: string;
  date: string;
  icon: string;
  content: string[];
};

const newsDetails: NewsDetailsItem[] = [
  {
    id: 1,
    title:
      "الوكالة الجزائرية لترقية الاستثمار تعزز خدماتها للمستثمرين",
    category: "أخبار الوكالة",
    date: "02 سبتمبر 2026",
    icon: "bi-building",
    content: [
      "تواصل الوكالة الجزائرية لترقية الاستثمار تطوير خدماتها الموجهة للمستثمرين بهدف تحسين تجربة المستثمر وتسهيل الوصول إلى المعلومات والخدمات المتعلقة بالمشاريع الاستثمارية.",
      "وتندرج هذه الجهود ضمن مسار يهدف إلى توفير بيئة استثمارية أكثر وضوحًا وفعالية، مع تعزيز المرافقة وتوفير المعلومات التي يحتاجها أصحاب المشاريع في مختلف المراحل.",
      "كما تساهم الخدمات الرقمية في تقريب المعلومات من المستثمر وتسهيل الوصول إلى الموارد والأدلة المتعلقة بالاستثمار في الجزائر.",
    ],
  },
  {
    id: 2,
    title: "فرص استثمارية جديدة في عدد من القطاعات",
    category: "الاستثمار",
    date: "28 أوت 2026",
    icon: "bi-graph-up-arrow",
    content: [
      "تتوفر في الجزائر إمكانات استثمارية متنوعة في عدد من القطاعات الاقتصادية، وهو ما يفتح المجال أمام المستثمرين لاستكشاف مشاريع وفرص جديدة.",
      "وتشمل هذه الإمكانات قطاعات الصناعة والفلاحة والطاقة والسياحة والتكنولوجيا والنقل واللوجستيك وغيرها من المجالات.",
      "ويمكن للمستثمر الاطلاع على الفرص المتاحة ودراسة مدى ملاءمتها مع أهداف مشروعه وخبرته وإمكاناته.",
    ],
  },
  {
    id: 3,
    title: "لقاء حول تطوير بيئة الأعمال والاستثمار",
    category: "فعاليات",
    date: "25 أوت 2026",
    icon: "bi-people",
    content: [
      "تم تنظيم لقاء حول تطوير بيئة الأعمال والاستثمار ومناقشة عدد من المحاور المرتبطة بتحسين مرافقة المستثمرين.",
      "وشكل اللقاء فرصة لتبادل الآراء ومناقشة التحديات التي تواجه أصحاب المشاريع والبحث عن حلول عملية تساعد على تحسين المسار الاستثماري.",
      "كما تم التأكيد على أهمية تطوير الخدمات وتعزيز التواصل مع المستثمرين.",
    ],
  },
  {
    id: 4,
    title: "مستجدات حول الخدمات الرقمية للمستثمر",
    category: "مستجدات",
    date: "20 أوت 2026",
    icon: "bi-laptop",
    content: [
      "تشهد الخدمات الرقمية الموجهة للمستثمر تطورًا مستمرًا بهدف تسهيل الوصول إلى المعلومات والموارد المتعلقة بالمشاريع الاستثمارية.",
      "وتسمح الحلول الرقمية بتوفير المعلومات بشكل أسرع وأكثر تنظيمًا، مما يساعد المستثمر على متابعة مختلف مراحل مشروعه.",
      "وتشكل الرقمنة عنصرًا مهمًا في تحسين جودة الخدمات وتطوير العلاقة بين المستثمر والهيئات المعنية.",
    ],
  },
  {
    id: 5,
    title: "تطوير فرص الاستثمار في القطاع الصناعي",
    category: "الاستثمار",
    date: "16 أوت 2026",
    icon: "bi-buildings",
    content: [
      "يمثل القطاع الصناعي أحد المجالات المهمة أمام المستثمرين الراغبين في تطوير مشاريع منتجة وخلق قيمة مضافة.",
      "وتوفر مختلف مناطق الجزائر إمكانات متنوعة يمكن استغلالها لإنجاز مشاريع صناعية في عدة تخصصات.",
      "ويساهم تطوير الاستثمار الصناعي في دعم النشاط الاقتصادي وخلق فرص العمل وتعزيز الإنتاج المحلي.",
    ],
  },
  {
    id: 6,
    title: "ندوة تعريفية حول مسار المستثمر",
    category: "فعاليات",
    date: "12 أوت 2026",
    icon: "bi-mic",
    content: [
      "شكلت الندوة التعريفية فرصة لتقديم معلومات حول مختلف مراحل إنجاز المشروع الاستثماري.",
      "وتضمنت الندوة توضيحات حول إعداد فكرة المشروع ودراسة المشروع والإجراءات وصولًا إلى مرحلة الإنجاز.",
      "كما تم التطرق إلى أهمية الحصول على المعلومات الصحيحة قبل اتخاذ القرارات المتعلقة بالمشروع.",
    ],
  },
  {
    id: 7,
    title: "إطلاق موارد جديدة لفائدة المستثمرين",
    category: "مستجدات",
    date: "08 أوت 2026",
    icon: "bi-file-earmark-text",
    content: [
      "تم توفير مجموعة من الموارد والأدلة التي تساعد المستثمرين وأصحاب المشاريع على التعرف على مختلف مراحل المسار الاستثماري.",
      "وتوفر هذه الموارد معلومات عملية يمكن الاستفادة منها أثناء إعداد المشروع ودراسة احتياجاته.",
      "وتهدف هذه المبادرات إلى تسهيل الوصول إلى المعلومة وتحسين تجربة المستثمر.",
    ],
  },
  {
    id: 8,
    title: "تشجيع الاستثمار في الطاقات المتجددة",
    category: "الاستثمار",
    date: "03 أوت 2026",
    icon: "bi-sun",
    content: [
      "يمثل قطاع الطاقات المتجددة مجالًا واعدًا للاستثمار بالنظر إلى الإمكانات المتاحة وفرص تطوير مشاريع جديدة.",
      "ويمكن للمشاريع المتعلقة بالطاقة الشمسية والطاقات النظيفة أن تساهم في دعم التنمية الاقتصادية وتنويع مصادر الطاقة.",
      "ويظل هذا المجال من القطاعات التي يمكن للمستثمرين استكشاف إمكاناتها وفرصها المستقبلية.",
    ],
  },
  {
    id: 9,
    title: "اجتماع حول تحسين مرافقة المستثمر",
    category: "أخبار الوكالة",
    date: "29 جويلية 2026",
    icon: "bi-chat-square-text",
    content: [
      "تم خلال الاجتماع مناقشة مجموعة من المحاور المتعلقة بتحسين مرافقة المستثمرين وتطوير الخدمات المقدمة لهم.",
      "وشملت النقاشات أهمية تبسيط المعلومات وتحسين التواصل وتوفير توجيه أكثر فعالية لأصحاب المشاريع.",
      "وتأتي هذه الجهود ضمن العمل المستمر على تطوير بيئة مناسبة لإنجاز المشاريع الاستثمارية.",
    ],
  },
];

function NewsDetails() {
  const { id } = useParams<{ id: string }>();
  const newsId = Number(id);

  const article = newsDetails.find(
    (item) => item.id === newsId
  );

  if (!article) {
    return (
      <section className="news-details-not-found">
        <div className="container">
          <div className="news-details-empty">
            <div className="news-details-empty-icon">
              <i
                className="bi bi-newspaper"
                aria-hidden="true"
              ></i>
            </div>

            <h1>الخبر غير موجود</h1>

            <p>
              عذرًا، لم نتمكن من العثور على الخبر الذي تبحث عنه.
            </p>

            <Link
              to="/news"
              className="aapi-primary-button"
            >
              العودة إلى الأخبار

              <i
                className="bi bi-arrow-left"
                aria-hidden="true"
              ></i>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* =========================================================
          HERO
          ========================================================= */}
      <section className="inner-hero news-details-hero">
        <div className="container">
          <div className="inner-hero-content">
            <span>{article.category}</span>

            <h1>تفاصيل الخبر</h1>

            <p>{article.date}</p>
          </div>
        </div>
      </section>

      {/* =========================================================
          ARTICLE
          ========================================================= */}
      <section className="news-details-section">
        <div className="container">
          <div className="row g-5">
            {/* MAIN CONTENT */}
            <div className="col-lg-8">
              <article className="news-details-article">
                <div className="news-details-cover">
                  <div className="news-details-cover-pattern"></div>

                  <div className="news-details-cover-icon">
                    <i
                      className={`bi ${article.icon}`}
                      aria-hidden="true"
                    ></i>
                  </div>

                  <span className="news-details-cover-category">
                    {article.category}
                  </span>

                  <div className="news-details-cover-date">
                    <i
                      className="bi bi-calendar3"
                      aria-hidden="true"
                    ></i>

                    {article.date}
                  </div>
                </div>

                <div className="news-details-content">
                  <div className="news-details-meta">
                    <span>
                      <i
                        className="bi bi-newspaper"
                        aria-hidden="true"
                      ></i>

                      أخبار الوكالة
                    </span>

                    <span>
                      <i
                        className="bi bi-calendar3"
                        aria-hidden="true"
                      ></i>

                      {article.date}
                    </span>
                  </div>

                  <h1>{article.title}</h1>

                  <div className="news-details-divider"></div>

                  {article.content.map(
                    (paragraph, index) => (
                      <p key={`${article.id}-${index}`}>
                        {paragraph}
                      </p>
                    )
                  )}

                  {/* SHARE */}
                  <div className="news-details-share">
                    <span>مشاركة الخبر</span>

                    <div className="news-share-buttons">
                      <button
                        type="button"
                        aria-label="مشاركة عبر فيسبوك"
                      >
                        <i
                          className="bi bi-facebook"
                          aria-hidden="true"
                        ></i>
                      </button>

                      <button
                        type="button"
                        aria-label="مشاركة عبر X"
                      >
                        <i
                          className="bi bi-twitter-x"
                          aria-hidden="true"
                        ></i>
                      </button>

                      <button
                        type="button"
                        aria-label="مشاركة عبر لينكدإن"
                      >
                        <i
                          className="bi bi-linkedin"
                          aria-hidden="true"
                        ></i>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            {/* SIDEBAR */}
            <div className="col-lg-4">
              <aside className="news-details-sidebar">
                {/* MEDIA CENTER */}
                <div className="news-sidebar-card">
                  <div className="news-sidebar-icon">
                    <i
                      className="bi bi-newspaper"
                      aria-hidden="true"
                    ></i>
                  </div>

                  <h3>المركز الإعلامي</h3>

                  <p>
                    تابع آخر أخبار الوكالة والمستجدات المتعلقة
                    بالاستثمار.
                  </p>

                  <Link
                    to="/news"
                    className="news-sidebar-link"
                  >
                    جميع الأخبار

                    <i
                      className="bi bi-arrow-left"
                      aria-hidden="true"
                    ></i>
                  </Link>
                </div>

                {/* OPPORTUNITIES */}
                <div className="news-sidebar-card news-sidebar-green">
                  <span>فرص استثمارية</span>

                  <h3>
                    اكتشف فرص الاستثمار
                  </h3>

                  <p>
                    استكشف القطاعات والمشاريع والفرص الاستثمارية
                    المتاحة.
                  </p>

                  <Link
                    to="/opportunities"
                    className="aapi-white-button"
                  >
                    اكتشف الفرص

                    <i
                      className="bi bi-arrow-left"
                      aria-hidden="true"
                    ></i>
                  </Link>
                </div>

                {/* CONTACT */}
                <div className="news-sidebar-card">
                  <h3>هل تحتاج إلى مساعدة؟</h3>

                  <p>
                    يمكنك التواصل معنا للحصول على المزيد من
                    المعلومات.
                  </p>

                  <Link
                    to="/contact"
                    className="news-sidebar-contact"
                  >
                    اتصل بنا

                    <i
                      className="bi bi-arrow-left"
                      aria-hidden="true"
                    ></i>
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BACK
          ========================================================= */}
      <section className="news-details-bottom">
        <div className="container">
          <Link
            to="/news"
            className="news-back-button"
          >
            <i
              className="bi bi-arrow-right"
              aria-hidden="true"
            ></i>

            العودة إلى جميع الأخبار
          </Link>
        </div>
      </section>
    </>
  );
}

export default NewsDetails;
import { Link } from "react-router-dom";

type EventItem = {
  id: number;
  month: string;
  day: string;
  type: string;
  title: string;
  location: string;
  time: string;
  description: string;
};

const events: EventItem[] = [
  {
    id: 1,
    month: "سبتمبر",
    day: "12",
    type: "ملتقى استثماري",
    title: "الملتقى الوطني حول فرص الاستثمار",
    location: "الجزائر العاصمة",
    time: "09:00 - 17:00",
    description:
      "ملتقى وطني للتعريف بأهم الفرص الاستثمارية ومناقشة آليات تطوير المشاريع ودعم المستثمرين.",
  },
  {
    id: 2,
    month: "سبتمبر",
    day: "18",
    type: "ندوة",
    title: "ندوة حول تمويل المشاريع الاستثمارية",
    location: "وهران",
    time: "10:00 - 15:00",
    description:
      "ندوة تعريفية حول مختلف آليات تمويل المشاريع الاستثمارية والخدمات المتاحة لأصحاب المشاريع.",
  },
  {
    id: 3,
    month: "أكتوبر",
    day: "05",
    type: "منتدى",
    title: "منتدى الأعمال والاستثمار",
    location: "قسنطينة",
    time: "09:30 - 16:00",
    description:
      "منتدى يجمع المستثمرين وأصحاب المؤسسات للتعريف بفرص التعاون والاستثمار في مختلف القطاعات.",
  },
  {
    id: 4,
    month: "أكتوبر",
    day: "14",
    type: "ورشة عمل",
    title: "ورشة حول المسار الاستثماري",
    location: "الجزائر العاصمة",
    time: "09:30 - 13:00",
    description:
      "ورشة عملية للتعريف بمراحل إنجاز المشروع الاستثماري والإجراءات والخدمات المتاحة للمستثمر.",
  },
  {
    id: 5,
    month: "أكتوبر",
    day: "22",
    type: "لقاء أعمال",
    title: "لقاء المستثمرين وأصحاب المشاريع",
    location: "سطيف",
    time: "10:00 - 16:00",
    description:
      "لقاء يهدف إلى تعزيز التواصل بين المستثمرين وأصحاب المشاريع واستعراض فرص التعاون والشراكة.",
  },
  {
    id: 6,
    month: "نوفمبر",
    day: "03",
    type: "ملتقى",
    title: "ملتقى الاستثمار والطاقات المتجددة",
    location: "وهران",
    time: "09:00 - 17:00",
    description:
      "ملتقى متخصص حول إمكانات الاستثمار في الطاقات المتجددة والمشاريع المستدامة.",
  },
];

function EventsPage() {
  return (
    <>
      {/* =========================================================
          HERO
          ========================================================= */}
      <section className="inner-page">
        <div className="container">
          <span className="section-overline">
            الفعاليات
          </span>

          <h1>
            الأحداث والفعاليات
          </h1>

          <p>
            تعرف على الملتقيات والمنتديات والفعاليات
            القادمة.
          </p>
        </div>
      </section>

      {/* =========================================================
          INTRO
          ========================================================= */}
      <section className="events-page-intro">
        <div className="container">
          <div className="aapi-section-header">
            <div>
              <span className="section-overline">
                المواعيد القادمة
              </span>

              <h2>
                أهم
                <strong> الفعاليات الاستثمارية</strong>
              </h2>
            </div>

            <p>
              تابع أجندة الفعاليات والملتقيات والندوات
              المتعلقة بالاستثمار وريادة الأعمال وتطوير
              بيئة الأعمال.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          EVENTS LIST
          ========================================================= */}
      <section className="events-page-content">
        <div className="container">
          <div className="events-page-list">
            {events.map((event) => (
              <article
                className="events-page-card"
                key={event.id}
              >
                {/* DATE */}
                <div className="events-page-date">
                  <span>{event.month}</span>

                  <strong>{event.day}</strong>
                </div>

                {/* MAIN CONTENT */}
                <div className="events-page-main">
                  <span className="events-page-type">
                    {event.type}
                  </span>

                  <h2>{event.title}</h2>

                  <p>
                    {event.description}
                  </p>

                  <div className="events-page-info">
                    <span>
                      <i
                        className="bi bi-geo-alt"
                        aria-hidden="true"
                      ></i>

                      {event.location}
                    </span>

                    <span>
                      <i
                        className="bi bi-clock"
                        aria-hidden="true"
                      ></i>

                      {event.time}
                    </span>
                  </div>
                </div>

                {/* ACTION */}
                <div className="events-page-action">
                  <Link
                    to="/contact"
                    className="events-page-button"
                  >
                    معلومات أكثر

                    <i
                      className="bi bi-arrow-left"
                      aria-hidden="true"
                    ></i>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
          ========================================================= */}
      <section className="events-page-cta">
        <div className="container">
          <div className="events-page-cta-inner">
            <div>
              <span>ابقَ على اطلاع</span>

              <h2>
                اكتشف فرص
                <strong> الاستثمار</strong>
              </h2>

              <p>
                تابع آخر الأخبار والفعاليات والفرص
                الاستثمارية المتاحة.
              </p>
            </div>

            <Link
              to="/opportunities"
              className="aapi-white-button"
            >
              فرص الاستثمار

              <i
                className="bi bi-arrow-left"
                aria-hidden="true"
              ></i>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default EventsPage;
import { Link } from "react-router-dom";

interface EventItem {
  id: number;
  month: string;
  day: string;
  type: string;
  title: string;
  location: string;
  time: string;
}

function Events() {
  const events: EventItem[] = [
    {
      id: 1,
      month: "سبتمبر",
      day: "12",
      type: "ملتقى استثماري",
      title: "الملتقى الوطني حول فرص الاستثمار",
      location: "الجزائر العاصمة",
      time: "09:00 - 17:00",
    },
    {
      id: 2,
      month: "سبتمبر",
      day: "18",
      type: "ندوة",
      title: "ندوة حول تمويل المشاريع الاستثمارية",
      location: "وهران",
      time: "10:00 - 15:00",
    },
    {
      id: 3,
      month: "أكتوبر",
      day: "05",
      type: "منتدى",
      title: "منتدى الأعمال والاستثمار",
      location: "قسنطينة",
      time: "09:30 - 16:00",
    },
  ];

  return (
    <section className="events-section">
      <div className="container">

        <div className="events-header">
          <div>
            <span className="section-overline">
              المواعيد القادمة
            </span>

            <h2>
              الفعاليات
              <strong> والأحداث</strong>
            </h2>
          </div>

          <div className="events-header-right">
            <p>
              تعرف على أهم الملتقيات والندوات والفعاليات
              المرتبطة بمجال الاستثمار.
            </p>

            <Link
              to="/events"
              className="events-all-link"
            >
              <span>جميع الفعاليات</span>

              <i
                className="bi bi-arrow-left"
                aria-hidden="true"
              ></i>
            </Link>
          </div>
        </div>

        <div className="events-list">
          {events.map((event) => (
            <article
              className="event-item"
              key={event.id}
            >
              <div className="event-date">
                <span>{event.month}</span>
                <strong>{event.day}</strong>
              </div>

              <div className="event-main">
                <span className="event-type">
                  {event.type}
                </span>

                <h3>{event.title}</h3>

                <div className="event-info">
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

              <Link
                to="/events"
                className="event-arrow"
                aria-label={`عرض ${event.title}`}
              >
                <i
                  className="bi bi-arrow-left"
                  aria-hidden="true"
                ></i>
              </Link>
            </article>
          ))}
        </div>

        <div className="events-bottom">
          <Link
            to="/events"
            className="green-outline-button"
          >
            <span>اكتشف جميع الفعاليات</span>

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

export default Events;
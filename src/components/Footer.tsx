import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="aapi-footer">
      <div className="container">
        <div className="footer-main">

          <div className="footer-brand">

            {/* LOGO */}
            <div className="footer-logo">
              <img
                src="public/logo.png"
                alt="الوكالة الجزائرية لترقية الاستثمار"
                className="footer-logo-image"
              />
            </div>

            <h3>
              الوكالة الجزائرية
              <br />
              لترقية الاستثمار
            </h3>

            <p>
              مرافقة المستثمرين وتسهيل الإجراءات وترقية الاستثمارات المنتجة عبر كامل التراب الوطني.
            </p>

            <div className="footer-social">
              <a href="#" aria-label="Facebook">
                <i className="bi bi-facebook" />
              </a>

              <a href="#" aria-label="LinkedIn">
                <i className="bi bi-linkedin" />
              </a>

              <a href="#" aria-label="YouTube">
                <i className="bi bi-youtube" />
              </a>

              <a href="#" aria-label="Instagram">
                <i className="bi bi-instagram" />
              </a>
            </div>

          </div>

          <div className="footer-column">
            <h4>الوكالة</h4>

            <Link to="/agency">
              تقديم الوكالة
            </Link>

            <Link to="/agency#missions">
              مهام الوكالة
            </Link>

            <Link to="/agency#values">
              مبادئ الوكالة
            </Link>

            <Link to="/agency#journey">
              مسار الاستثمار
            </Link>
          </div>

          <div className="footer-column">
            <h4>المستثمر</h4>

            <Link to="/investor">
              فضاء المستثمر
            </Link>

            <Link to="/opportunities">
              فرص الاستثمار
            </Link>

            <Link to="/sectors">
              قطاعات الاستثمار
            </Link>

            <Link to="/investor#investor-faq">
              الأسئلة الشائعة
            </Link>
          </div>

          <div className="footer-column">
            <h4>تواصل معنا</h4>

            <div className="footer-contact">
              <i className="bi bi-geo-alt" />
              <span>
                الجزائر العاصمة، الجزائر
              </span>
            </div>

            <div className="footer-contact">
              <i className="bi bi-envelope" />
              <span>
                contact@aapi.dz
              </span>
            </div>

            <div className="footer-contact">
              <i className="bi bi-telephone" />
              <span>
                +213 21 00 00 00
              </span>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <span>
            © 2026 الوكالة الجزائرية لترقية الاستثمار. جميع الحقوق محفوظة.
          </span>

          <div>
            <Link to="/contact">
              سياسة الخصوصية
            </Link>

            <Link to="/contact">
              شروط الاستخدام
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
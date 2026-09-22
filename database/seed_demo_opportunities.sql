SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS opportunities (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  secteur VARCHAR(150) NOT NULL,
  icone VARCHAR(100) NOT NULL DEFAULT 'bi-buildings',
  titre VARCHAR(255) NOT NULL,
  wilaya VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  investissement VARCHAR(150) NOT NULL,
  emplois VARCHAR(100) NOT NULL,
  image VARCHAR(500) NULL,
  statut ENUM('publie','brouillon','archive') NOT NULL DEFAULT 'publie',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_opportunities_statut (statut),
  KEY idx_opportunities_secteur (secteur)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO opportunities
(secteur, icone, titre, wilaya, description, investissement, emplois, image, statut)
VALUES
('الصناعة','bi-buildings','وحدة صناعية لإنتاج مواد البناء','الجزائر','فرصة استثمارية لإنشاء وحدة صناعية متخصصة في إنتاج مواد البناء وتلبية احتياجات السوق.','استثمار متوسط','120 منصب','https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80','publie'),
('الفلاحة','bi-tree','مشروع فلاحي متكامل','بسكرة','إنشاء واستغلال مشروع فلاحي حديث يعتمد على تقنيات الري والإنتاج الزراعي العصري.','استثمار متوسط','80 منصب','https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80','publie'),
('الطاقة','bi-sun','محطة لإنتاج الطاقة الشمسية','الهضاب العليا','تطوير مشروع لإنتاج الطاقة الكهربائية من مصادر الطاقة الشمسية المتجددة.','استثمار كبير','150 منصب','https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80','publie'),
('السياحة','bi-buildings','مجمع سياحي وفندقي','وهران','إنجاز مركب سياحي حديث يوفر خدمات الإقامة والترفيه والأنشطة السياحية.','استثمار كبير','200 منصب','https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80','publie'),
('التكنولوجيا','bi-cpu','مركز للتكنولوجيا والابتكار','الجزائر العاصمة','إنشاء مركز متخصص في الحلول الرقمية والابتكار وتطوير المؤسسات الناشئة.','استثمار متوسط','100 منصب','https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80','publie'),
('النقل','bi-truck','منصة لوجستية متكاملة','سطيف','تطوير منصة لوجستية حديثة لدعم عمليات التخزين والنقل والتوزيع.','استثمار كبير','170 منصب','https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1200&q=80','publie')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

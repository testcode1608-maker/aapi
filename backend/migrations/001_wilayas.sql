USE aapi_db;

CREATE TABLE IF NOT EXISTS wilayas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code CHAR(2) NOT NULL UNIQUE,
    nom_fr VARCHAR(100) NOT NULL,
    nom_ar VARCHAR(100) NOT NULL,
    statut ENUM('actif','inactif') NOT NULL DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wilayas_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO wilayas (code, nom_fr, nom_ar) VALUES
('01','Adrar','أدرار'),('02','Chlef','الشلف'),('03','Laghouat','الأغواط'),('04','Oum El Bouaghi','أم البواقي'),('05','Batna','باتنة'),('06','Béjaïa','بجاية'),('07','Biskra','بسكرة'),('08','Béchar','بشار'),('09','Blida','البليدة'),('10','Bouira','البويرة'),('11','Tamanrasset','تمنراست'),('12','Tébessa','تبسة'),('13','Tlemcen','تلمسان'),('14','Tiaret','تيارت'),('15','Tizi Ouzou','تيزي وزو'),('16','Alger','الجزائر'),('17','Djelfa','الجلفة'),('18','Jijel','جيجل'),('19','Sétif','سطيف'),('20','Saïda','سعيدة'),('21','Skikda','سكيكدة'),('22','Sidi Bel Abbès','سيدي بلعباس'),('23','Annaba','عنابة'),('24','Guelma','قالمة'),('25','Constantine','قسنطينة'),('26','Médéa','المدية'),('27','Mostaganem','مستغانم'),('28','M’Sila','المسيلة'),('29','Mascara','معسكر'),('30','Ouargla','ورقلة'),('31','Oran','وهران'),('32','El Bayadh','البيض'),('33','Illizi','إليزي'),('34','Bordj Bou Arréridj','برج بوعريرidj'),('35','Boumerdès','بومرداس'),('36','El Tarf','الطارف'),('37','Tindouf','تندوف'),('38','Tissemsilt','تيسمسيلت'),('39','El Oued','الوادي'),('40','Khenchela','خنشلة'),('41','Souk Ahras','سوق أهراس'),('42','Tipaza','تيبازة'),('43','Mila','ميلة'),('44','Aïn Defla','عين الدفلى'),('45','Naâma','النعامة'),('46','Aïn Témouchent','عين تموشنت'),('47','Ghardaïa','غرداية'),('48','Relizane','غليزان'),('49','Timimoun','تيميمون'),('50','Bordj Badji Mokhtar','برج باجي مختار'),('51','Ouled Djellal','أولاد جلال'),('52','Béni Abbès','بني عباس'),('53','In Salah','عين صالح'),('54','In Guezzam','عين قزام'),('55','Touggourt','تقرت'),('56','Djanet','جانت'),('57','El M’Ghair','المغير'),('58','El Meniaa','المنيعة')
ON DUPLICATE KEY UPDATE nom_fr=VALUES(nom_fr), nom_ar=VALUES(nom_ar), statut='actif';

# عقد API لإحصائيات الصفحة الرئيسية

الصفحة الرئيسية في React تقرأ الإحصائيات الحقيقية من:

`http://localhost/aapi-api/statistics.php`

نقطة النهاية الحقيقية موجودة في مشروع PHP المنفصل `aapi-api`، ويجب أن تعيد JSON بهذا الشكل:

```json
{
  "success": true,
  "data": {
    "projects": 57,
    "investors": 53,
    "investment_value": 2407500000,
    "jobs": 3433
  }
}
```

الحقول المستخدمة في قاعدة البيانات:

- `projects.id` → عدد المشاريع
- `users.role = 'investisseur'` و `users.statut = 'actif'` → عدد المستثمرين النشطين
- `projects.montant_investissement` → قيمة الاستثمار
- `projects.nombre_emplois` → عدد مناصب العمل

بالنسبة لقيمة الاستثمار ومناصب العمل، يتم استبعاد المشاريع المؤرشفة بواسطة `statut <> 'archive'`.

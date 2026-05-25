-- =========================================
-- FULL DESCRIPTION DATA FOR ALL PRODUCTS
-- =========================================

UPDATE Product
SET Description = CASE Id

WHEN 1 THEN N'Bút bi Thiên Long TL-027 với thiết kế nhỏ gọn, viết êm tay, phù hợp cho học sinh, sinh viên và nhân viên văn phòng.'

WHEN 2 THEN N'Bút chì 2B chất lượng cao, nét viết đậm rõ, dễ tẩy xóa, thích hợp cho học tập và vẽ kỹ thuật.'

WHEN 3 THEN N'Vở học sinh 200 trang giấy trắng mịn, chống lem mực, bìa cứng chắc chắn và bền đẹp.'

WHEN 4 THEN N'Giấy A4 Double A cao cấp với độ trắng vượt trội, in ấn sắc nét và chống kẹt giấy hiệu quả.'

WHEN 5 THEN N'Kẹp giấy nhỏ gọn, chất liệu kim loại chắc chắn, giúp cố định tài liệu gọn gàng và tiện lợi.'

WHEN 6 THEN N'Bìa hồ sơ A4 bền đẹp, hỗ trợ lưu trữ tài liệu khoa học và chuyên nghiệp.'

WHEN 7 THEN N'Bút dạ bảng Artline với mực đậm màu, dễ lau sạch, thích hợp cho bảng trắng văn phòng và lớp học.'

WHEN 8 THEN N'Bộ bút màu 12 cây với màu sắc tươi sáng, an toàn cho trẻ em và hỗ trợ phát triển sáng tạo.'

WHEN 9 THEN N'Thước nhựa 20cm trong suốt, dễ đo đạc chính xác và có độ bền cao.'

WHEN 10 THEN N'Tẩy mềm Uni giúp tẩy sạch nét chì mà không làm rách giấy, ít để lại bụi.'

WHEN 11 THEN N'Ghim bấm giấy chắc chắn, phù hợp cho văn phòng và học tập hàng ngày.'

WHEN 12 THEN N'Băng keo trong suốt với độ bám dính cao, tiện lợi trong học tập và đóng gói.'

WHEN 13 THEN N'Sổ tay mini nhỏ gọn, tiện mang theo để ghi chú nhanh mọi lúc mọi nơi.'

WHEN 14 THEN N'Bút lông dầu chống nước, viết được trên nhiều bề mặt với màu sắc rõ nét.'

WHEN 15 THEN N'Giấy note vàng tiện lợi giúp ghi chú công việc, học tập và nhắc việc hiệu quả.'

WHEN 16 THEN N'Bút gel mực xanh viết mượt mà, ra mực đều và tạo cảm giác êm tay khi sử dụng.'

WHEN 17 THEN N'Kéo cắt giấy lưỡi sắc bén, tay cầm chắc chắn và an toàn khi sử dụng.'

WHEN 18 THEN N'Compa học sinh hỗ trợ vẽ hình chính xác, thiết kế bền đẹp và dễ điều chỉnh.'

WHEN 19 THEN N'Hồ dán chất lượng cao với độ kết dính tốt, khô nhanh và an toàn cho học sinh.'

WHEN 20 THEN N'Bảng viết mini tiện lợi cho học tập, ghi chú và làm việc cá nhân.'

END
UPDATE ProductDetails
SET
    Description = CASE ProductId

        WHEN 1 THEN N'Bút bi Thiên Long TL-027 viết trơn, mực ra đều, phù hợp học tập và văn phòng'
        WHEN 2 THEN N'Bút chì 2B chất lượng cao, nét đậm, dễ tẩy'
        WHEN 3 THEN N'Vở học sinh giấy dày, chống lem mực'
        WHEN 4 THEN N'Giấy A4 Double A trắng sáng, in ấn sắc nét'
        WHEN 5 THEN N'Kẹp giấy nhỏ tiện lợi cho văn phòng'
        WHEN 6 THEN N'Bìa hồ sơ cứng chắc, bảo quản tài liệu tốt'
        WHEN 7 THEN N'Bút dạ bảng nét rõ, dễ lau'
        WHEN 8 THEN N'Bút màu học sinh nhiều màu sắc sinh động'
        WHEN 9 THEN N'Thước nhựa trong suốt, dễ đo chính xác'
        WHEN 10 THEN N'Tẩy mềm sạch, không làm rách giấy'
        WHEN 11 THEN N'Ghim bấm giấy chắc chắn, dễ sử dụng'
        WHEN 12 THEN N'Băng keo trong dính tốt'
        WHEN 13 THEN N'Sổ tay mini tiện mang theo'
        WHEN 14 THEN N'Bút lông dầu viết được trên nhiều bề mặt'
        WHEN 15 THEN N'Giấy note vàng tiện ghi chú'
        WHEN 16 THEN N'Bút gel mực xanh viết êm'
        WHEN 17 THEN N'Kéo văn phòng sắc bén, an toàn'
        WHEN 18 THEN N'Compa học sinh chính xác'
        WHEN 19 THEN N'Hồ dán khô nhanh, bám tốt'
        WHEN 20 THEN N'Bảng viết mini tiện học tập'

    END,

    Brand = CASE ProductId

        WHEN 1 THEN N'Thiên Long'
        WHEN 2 THEN N'Faber Castell'
        WHEN 3 THEN N'Hồng Hà'
        WHEN 4 THEN N'Double A'
        WHEN 5 THEN N'Deli'
        WHEN 6 THEN N'Bến Nghé'
        WHEN 7 THEN N'Artline'
        WHEN 8 THEN N'Pentel'
        WHEN 9 THEN N'Deli'
        WHEN 10 THEN N'Uni'
        WHEN 11 THEN N'Plus'
        WHEN 12 THEN N'Deli'
        WHEN 13 THEN N'Campus'
        WHEN 14 THEN N'Artline'
        WHEN 15 THEN N'Muji'
        WHEN 16 THEN N'Thiên Long'
        WHEN 17 THEN N'Deli'
        WHEN 18 THEN N'Faber'
        WHEN 19 THEN N'M&G'
        WHEN 20 THEN N'Stabilo'

    END,

    Color = CASE ProductId

        WHEN 1 THEN N'Xanh'
        WHEN 2 THEN N'Đen'
        WHEN 3 THEN N'Trắng'
        WHEN 4 THEN N'Trắng'
        WHEN 5 THEN N'Bạc'
        WHEN 6 THEN N'Xanh'
        WHEN 7 THEN N'Đen'
        WHEN 8 THEN N'Nhiều màu'
        WHEN 9 THEN N'Trong suốt'
        WHEN 10 THEN N'Trắng'
        WHEN 11 THEN N'Bạc'
        WHEN 12 THEN N'Trong'
        WHEN 13 THEN N'Trắng'
        WHEN 14 THEN N'Đen'
        WHEN 15 THEN N'Vàng'
        WHEN 16 THEN N'Xanh'
        WHEN 17 THEN N'Đen'
        WHEN 18 THEN N'Đen'
        WHEN 19 THEN N'Trong'
        WHEN 20 THEN N'Trắng'

    END,

    Size = CASE ProductId

        WHEN 1 THEN N'0.5mm'
        WHEN 2 THEN N'2B'
        WHEN 3 THEN N'200 trang'
        WHEN 4 THEN N'A4'
        WHEN 5 THEN N'Small'
        WHEN 6 THEN N'A4'
        WHEN 7 THEN N'1mm'
        WHEN 8 THEN N'12 màu'
        WHEN 9 THEN N'20cm'
        WHEN 10 THEN N'Small'
        WHEN 11 THEN N'Standard'
        WHEN 12 THEN N'2cm'
        WHEN 13 THEN N'Mini'
        WHEN 14 THEN N'1mm'
        WHEN 15 THEN N'Small'
        WHEN 16 THEN N'0.5mm'
        WHEN 17 THEN N'Medium'
        WHEN 18 THEN N'Standard'
        WHEN 19 THEN N'Small'
        WHEN 20 THEN N'Mini'

    END,

    Quantity = 100
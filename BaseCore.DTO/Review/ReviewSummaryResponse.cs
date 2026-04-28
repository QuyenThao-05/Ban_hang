using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaseCore.DTO.Review
{
    public class ReviewSummaryResponse
    {
        public decimal AverageRating { get; set; }

        public int TotalReviews { get; set; }

        public int FiveStar { get; set; }

        public int FourStar { get; set; }

        public int ThreeStar { get; set; }

        public int TwoStar { get; set; }

        public int OneStar { get; set; }
    }
}

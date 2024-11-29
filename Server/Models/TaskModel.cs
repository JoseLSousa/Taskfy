using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Models
{
    public class TaskModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public DateTime DueDate { get; set; }
        public string UserId { get; set; }
        public User User { get; set; } = null;
    }
}
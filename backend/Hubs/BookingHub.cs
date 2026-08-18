using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace HomeCare_BE.Hubs
{
    public class BookingHub : Hub
    {
        public async Task SendNewBookingNotification(object bookingPayload)
        {
            await Clients.All.SendAsync("NewBookingCreated", bookingPayload);
        }
    }
}

async function handleNotifications(
  car_rent,
  user_id,
  dt,
  promotion_id,
  wallet_id
) {
  try {
    // Fetch user data to personalize notifications
    const user = await prisma.user.findUnique({ where: { id: user_id } });

    // Check if the user exists
    if (!user) {
      console.error("User not found:", user_id);
      return;
    }

    // Notification message for car rental
    const carRentNotification = {
      title: "New Car Rental Created",
      message: `Dear ${user.first_name}, your car rental has been successfully created.`,
      data: {
        car_rent_id: car_rent.id,
        promotion_id,
        wallet_id,
      },
      user_id: user.id,
    };

    // Broadcast notification to the user
    broadcast({
      client_id: user_id,
      ctx: "notification",
      data: { carRentNotification, dt },
    });

    // If there's a promotion, notify the user about the promotion
    if (promotion_id) {
      const promotion = await prisma.promotion.findUnique({
        where: { id: promotion_id },
      });
      if (promotion) {
        const promotionNotification = {
          title: "Promotion Applied",
          message: `Congratulations! You have successfully applied the promotion: ${promotion.name}.`,
          user_id: user.id,
        };
        broadcast({
          client_id: user_id,
          ctx: "notification",
          data: promotionNotification,
        });
      }
    }

    // Optional: Notify admins or other stakeholders about the new car rental
    const adminUsers = await prisma.user.findMany({ where: { role: "admin" } });
    for (const admin of adminUsers) {
      const adminNotification = {
        title: "New Car Rental Alert",
        message: `A new car rental has been created by ${user.first_name} ${user.last_name}.`,
        data: {
          car_rent_id: car_rent.id,
        },
        user_id: admin.id,
      };
      broadcast({
        client_id: admin.id,
        ctx: "notification",
        data: { adminNotification, dt },
      });
    }
  } catch (error) {
    console.error("Error handling notifications:", error);
  }
}

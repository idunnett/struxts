// export const fulfill = internalMutation({
//   args: { stripeId: v.string() },
//   handler: async ({ db }, { stripeId }) => {
//     const { _id: paymentId, text } = (await db
//       .query("payments")
//       .withIndex("stripeId", (q) => q.eq("stripeId", stripeId))
//       .unique())!
//     const messageId = await db.insert("messages", { text })
//     await db.patch(paymentId, { messageId })
//   },
// })

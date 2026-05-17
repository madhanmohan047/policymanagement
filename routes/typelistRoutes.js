const express = require("express");
const router = express.Router();
const {
  AccountStatus,
  ContactRole,
  ContactType,
  Country,
  Currency,
  JobStatus,
  JobType,
  Product,
  State,
  UserType,
  PolicyStatus,
  BodyType,
  LossCause,
  ClaimStatus,
  AffectedAreas,
  ProgramPlan,
} = require("../models");

/**
 * @swagger
 * /api/typelists/{type}:
 *   get:
 *     summary: Get a list of types/lookups
 *     tags: [Lookup]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [AccountStatus, ContactRole, ContactType, Country, Currency, JobStatus, JobType, Product, State, UserType, PolicyStatus, BodyType, LossCause, ClaimStatus, AffectedAreas, ProgramPlan]
 *         description: The name of the type model to retrieve.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                   name:
 *                     type: string
 *                   priority:
 *                     type: integer
 *       404:
 *         description: Type not found
 *       500:
 *         description: Server error
 */
router.get("/:type", async (req, res) => {
  try {
    const { type } = req.params;
    let model;

    const typeMap = {
      AccountStatus: AccountStatus,
      ContactRole: ContactRole,
      ContactType: ContactType,
      Country: Country,
      Currency: Currency,
      JobStatus: JobStatus,
      JobType: JobType,
      Product: Product,
      State: State,
      UserType: UserType,
      PolicyStatus: PolicyStatus,
      BodyType: BodyType,
      LossCause: LossCause,
      ClaimStatus: ClaimStatus,
      AffectedAreas: AffectedAreas,
      ProgramPlan: ProgramPlan,
    };

    model = typeMap[type];

    if (!model) {
      return res.status(404).json({ message: "Type not found" });
    }

    const typelist = await model.find();
    const result = typelist.map((item) => ({
      code: item.code,
      name: item.name,
      priority: item.priority,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

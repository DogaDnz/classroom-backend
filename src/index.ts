import { eq } from "drizzle-orm";
import { db, pool } from "./db/db";
import { departments, subjects } from "./schema";

async function main() {
  try {
    console.log("Starting CRUD operations...\n");

    // ------------------------
    // CREATE Department
    // ------------------------
    const [newDepartment] = await db
        .insert(departments)
        .values({
          code: "CS",
          name: "Computer Science",
          description: "Computer Science Department",
        })
        .returning();

    if (!newDepartment) {
      throw new Error("Failed to create department");
    }

    console.log("Department created:", newDepartment);

    // ------------------------
    // CREATE Subject
    // ------------------------
    const [newSubject] = await db
        .insert(subjects)
        .values({
          departmentId: newDepartment.id,
          code: "CS101",
          name: "Introduction to Programming",
          description: "Basics of programming",
        })
        .returning();

    if (!newSubject) {
      throw new Error("Failed to create subject");
    }

    console.log("Subject created:", newSubject);

    // ------------------------
    // READ (Join)
    // ------------------------
    const departmentWithSubjects = await db
      .select({
        department: departments,
        subject: subjects,
      })
      .from(departments)
      .leftJoin(subjects, eq(subjects.departmentId, departments.id));

    console.log("Departments with subjects:", departmentWithSubjects);

    // ------------------------
    // UPDATE Subject
    // ------------------------
    const [updatedSubject] = await db
        .update(subjects)
        .set({ name: "Intro to Programming (Updated)" })
        .where(eq(subjects.id, newSubject.id))
        .returning();

    console.log("Updated subject:", updatedSubject);

    // ------------------------
    // DELETE Subject
    // ------------------------
    await db.delete(subjects).where(eq(subjects.id, newSubject.id));
    console.log("Subject deleted.");

    // ------------------------
    // DELETE Department
    // ------------------------
    await db.delete(departments).where(eq(departments.id, newDepartment.id));
    console.log("Department deleted.");

    console.log("\nCRUD operations completed successfully.");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log("Database pool closed.");
    }
  }
}

main();

import { db } from "@/db";
import { BackendService } from "./backendService";

const backendService = new BackendService(db);

export { backendService };

import type { Metadata } from "next";
import { RoomExperience } from "@/components/room/RoomExperience";
import { RoomJsonLd } from "@/components/room/seo/RoomJsonLd";
import { roomMetadata } from "@/lib/room-metadata";
import { getRoomPhotos } from "@/lib/room-photos";
import { getRoomProjects } from "@/lib/room-projects";

export const metadata: Metadata = roomMetadata("cars");

export default function CarsPage() {
  return (
    <>
      <RoomJsonLd spot="cars" />
      <RoomExperience initialSpot="cars" projects={getRoomProjects()} photos={getRoomPhotos()} />
    </>
  );
}

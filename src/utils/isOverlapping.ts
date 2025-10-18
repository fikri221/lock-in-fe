import { Task, Tasks } from "@/types/task";

/**
 * Memeriksa apakah sebuah task bertumpuk dengan task lain dalam daftar.
 * @param {object} targetTask - Task yang ingin diperiksa. { id, startMinutes, durationMinutes }
 * @param {array} allTasks - Seluruh daftar task yang ada.
 * @returns {boolean} - True jika ada tumpukan, false jika tidak.
 */
export const isOverlapping = (targetTask: Task, allTasks: Tasks): boolean => {
  // Hitung waktu selesai dari task target
  const targetEndMinutes = targetTask.startMinutes + targetTask.durationMinutes;

  // Periksa terhadap setiap task lain dalam daftar
  for (const otherTask of allTasks) {
    // Lewati jika kita membandingkan dengan task yang sama
    if (otherTask.id === targetTask.id) {
      continue;
    }

    // Hitung waktu selesai dari task lain
    const otherEndMinutes = otherTask.startMinutes + otherTask.durationMinutes;

    // Terapkan logika deteksi tumpukan
    const isOverlapped = 
      targetTask.startMinutes < otherEndMinutes && 
      targetEndMinutes > otherTask.startMinutes;

    if (isOverlapped) {
      // Jika ditemukan satu saja tumpukan, langsung kembalikan true
      return true; 
    }
  }

  // Jika loop selesai tanpa menemukan tumpukan, kembalikan false
  return false;
};
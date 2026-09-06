-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "allergens" TEXT,
ADD COLUMN     "calories" INTEGER,
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "discountPrice" DECIMAL(10,2),
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featuredOrder" INTEGER,
ADD COLUMN     "prepTimeMinutes" INTEGER,
ADD COLUMN     "spicy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vegan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vegetarian" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_restaurantId_name_key" ON "Category"("restaurantId", "name");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

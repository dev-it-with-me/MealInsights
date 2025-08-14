/**
 * Unified list component for both ingredients and products
 */
import { useState } from "react";
import { Group, Text, Menu, Image, Button } from "@/shared/ui-kit";
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconSearch,
  IconLeaf,
  IconChefHat,
} from "@tabler/icons-react";
import { notifications } from "@/shared/ui-kit";

import type { UnifiedItem, UnifiedItemFilters } from "@/shared/lib/types";
import {
  getItemTypeLabel,
  getItemAdditionalInfo,
} from "@/shared/lib/utils/unifiedItems";
import { DietTagEnum } from "@/shared/lib/types";
import { createImageDataUrl, isValidPhotoData } from "../lib/imageUtils";

interface UnifiedItemsListProps {
  items: UnifiedItem[];
  isLoading?: boolean;
  onEdit?: (item: UnifiedItem) => void;
  onDelete?: (item: UnifiedItem) => void;
  onView?: (item: UnifiedItem) => void;
  onAddIngredient?: () => void;
  onAddProduct?: () => void;
  filters?: UnifiedItemFilters;
  onFiltersChange?: (filters: UnifiedItemFilters) => void;
  showFilters?: boolean;
}

const dietTagOptions = Object.values(DietTagEnum).map((tag) => ({
  value: tag,
  label: tag.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
}));

const UnifiedItemsList = ({
  items,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  onAddIngredient,
  onAddProduct,
  filters = {},
  onFiltersChange,
  showFilters = true,
}: UnifiedItemsListProps) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleFilterChange = (key: keyof UnifiedItemFilters, value: any) => {
    if (onFiltersChange) {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  const handleDelete = async (item: UnifiedItem) => {
    if (deleteConfirm !== item.id) {
      setDeleteConfirm(item.id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      await onDelete?.(item);
      setDeleteConfirm(null);
      notifications.show({
        title: "Success",
        message: `${getItemTypeLabel(item.type)} deleted successfully`,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: `Failed to delete ${item.type}`,
        color: "red",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <Text size="sm" style={{ color: "var(--color-surface-400)" }}>
            Loading items...
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Buttons - Calm Style */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Text
            size="xl"
            fw={300}
            style={{
              color: "var(--color-surface-50)",
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.025em",
            }}
          >
            Items Management
          </Text>
          <Text size="sm" style={{ color: "var(--color-surface-400)" }}>
            Manage your ingredients and products
          </Text>
        </div>
        <Group gap="sm">
          {onAddIngredient && (
            <Button
              onClick={onAddIngredient}
              leftSection={<IconLeaf size={16} />}
              variant="gradient"
              gradient={{ from: "primary", to: "primary.6" }}
              size="sm"
            >
              Add Ingredient
            </Button>
          )}
          {onAddProduct && (
            <Button
              onClick={onAddProduct}
              leftSection={<IconChefHat size={16} />}
              variant="gradient"
              gradient={{ from: "secondary", to: "secondary.6" }}
              size="sm"
            >
              Add Product
            </Button>
          )}
        </Group>
      </div>

      {/* Filters - Sophisticated Design */}
      {showFilters && (
        <div
          className="relative overflow-hidden rounded-2xl transition-all duration-300"
          style={{
            background: `linear-gradient(145deg, color-mix(in srgb, var(--color-surface-800) 50%, transparent), color-mix(in srgb, var(--color-surface-900) 70%, transparent))`,
            border: `1px solid color-mix(in srgb, var(--color-surface-700) 30%, transparent)`,
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Search Input */}
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <IconSearch
                  size={18}
                  style={{ color: "var(--color-surface-400)" }}
                />
              </div>
              <input
                type="text"
                placeholder="Search ingredients and products..."
                value={filters.name_filter || ""}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleFilterChange("name_filter", event.currentTarget.value)
                }
                className="w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 placeholder:text-surface-400"
                style={{
                  background: `color-mix(in srgb, var(--color-surface-900) 70%, transparent)`,
                  border: `1px solid color-mix(in srgb, var(--color-surface-600) 30%, transparent)`,
                  color: "var(--color-surface-100)",
                }}
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="p-6 space-y-6">
            {/* Item Type Filter - Top Position */}
            <div className="space-y-3">
              <Text
                size="xs"
                fw={500}
                style={{ color: "var(--color-surface-300)" }}
                className="uppercase tracking-wider"
              >
                Item Type
              </Text>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "All Items", icon: null },
                  { value: "ingredient", label: "Ingredients", icon: IconLeaf },
                  { value: "product", label: "Products", icon: IconChefHat },
                ].map((option) => {
                  const isActive =
                    (filters.type_filter || "all") === option.value;
                  const IconComponent = option.icon;

                  return (
                    <Button
                      key={option.value}
                      onClick={() =>
                        handleFilterChange("type_filter", option.value)
                      }
                      variant={isActive ? "gradient" : "subtle"}
                      gradient={
                        isActive
                          ? option.value === "ingredient"
                            ? { from: "primary.4", to: "primary.6" }
                            : option.value === "product"
                            ? { from: "secondary.4", to: "secondary.6" }
                            : { from: "gray.6", to: "gray.8" }
                          : undefined
                      }
                      color={isActive ? undefined : "gray"}
                      leftSection={
                        IconComponent ? <IconComponent size={16} /> : undefined
                      }
                      size="xs"
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Diet Tags - Full Width */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Text
                  size="xs"
                  fw={500}
                  style={{ color: "var(--color-surface-300)" }}
                  className="uppercase tracking-wider"
                >
                  Diet Tags
                </Text>
                {filters.tag_filter && filters.tag_filter.length > 0 && (
                  <Button
                    onClick={() => handleFilterChange("tag_filter", [])}
                    variant="subtle"
                    color="gray"
                    size="xs"
                  >
                    Clear ({filters.tag_filter.length})
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {dietTagOptions.map((tag) => {
                  const isSelected =
                    filters.tag_filter?.includes(tag.value) || false;

                  return (
                    <Button
                      key={tag.value}
                      onClick={() => {
                        const current = filters.tag_filter || [];
                        const updated = isSelected
                          ? current.filter((t) => t !== tag.value)
                          : [...current, tag.value];
                        handleFilterChange("tag_filter", updated);
                      }}
                      variant={isSelected ? "filled" : "light"}
                      color={isSelected ? "secondary" : "gray"}
                      size="xs"
                      className="justify-start"
                    >
                      {tag.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Active Filters Summary */}
            {(filters.name_filter ||
              filters.type_filter !== "all" ||
              (filters.tag_filter && filters.tag_filter.length > 0)) && (
              <div className="pt-4 border-t border-surface-700/30">
                <div className="flex items-center gap-2 flex-wrap">
                  <Text size="xs" style={{ color: "var(--color-surface-400)" }}>
                    Active filters:
                  </Text>
                  {filters.name_filter && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                      style={{
                        background: `color-mix(in srgb, var(--color-primary-500) 10%, transparent)`,
                        color: "var(--color-primary-300)",
                      }}
                    >
                      "{filters.name_filter}"
                    </span>
                  )}
                  {filters.type_filter && filters.type_filter !== "all" && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                      style={{
                        background: `color-mix(in srgb, var(--color-secondary-500) 10%, transparent)`,
                        color: "var(--color-secondary-300)",
                      }}
                    >
                      {filters.type_filter}
                    </span>
                  )}
                  {filters.tag_filter && filters.tag_filter.length > 0 && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                      style={{
                        background: `color-mix(in srgb, var(--color-primary-500) 10%, transparent)`,
                        color: "var(--color-primary-300)",
                      }}
                    >
                      {filters.tag_filter.length} tag
                      {filters.tag_filter.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Items Grid - Calm Style */}
      {items.length === 0 ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: `linear-gradient(45deg, var(--color-primary-500)/20, var(--color-secondary-500)/20)`,
              }}
            >
              <IconSearch
                size={24}
                style={{ color: "var(--color-surface-400)" }}
              />
            </div>
            <Text
              size="lg"
              fw={300}
              style={{ color: "var(--color-surface-300)" }}
              mb="sm"
            >
              No items found
            </Text>
            <Text size="sm" style={{ color: "var(--color-surface-500)" }}>
              {filters.name_filter ||
              filters.type_filter !== "all" ||
              filters.tag_filter?.length
                ? "Try adjusting your filters to find what you're looking for"
                : "Start building your pantry by adding some ingredients or products"}
            </Text>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            // Determine the image source
            let imageSrc: string | null = null;
            if (item.photo_url && item.photo_url.trim().length > 0) {
              imageSrc = item.photo_url;
            } else if (
              item.type === "ingredient" &&
              item.ingredient?.photo_data &&
              isValidPhotoData(item.ingredient.photo_data)
            ) {
              imageSrc = createImageDataUrl(
                item.ingredient.photo_data as string
              );
            } else if (
              item.type === "product" &&
              item.product?.photo_data &&
              isValidPhotoData(item.product.photo_data)
            ) {
              imageSrc = createImageDataUrl(item.product.photo_data as string);
            }

            return (
              <div
                key={item.id}
                className="group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                style={{
                  background: `linear-gradient(145deg, color-mix(in srgb, var(--color-surface-800) 60%, transparent), color-mix(in srgb, var(--color-surface-900) 80%, transparent))`,
                  border: `1px solid color-mix(in srgb, var(--color-surface-700) 40%, transparent)`,
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* Image Section */}
                <div className="relative overflow-hidden h-48">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      height={192}
                      alt={item.name}
                      fallbackSrc="/placeholder-image.png"
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="h-full flex items-center justify-center relative"
                      style={{
                        background: `linear-gradient(45deg, color-mix(in srgb, var(--color-surface-700) 40%, transparent), color-mix(in srgb, var(--color-surface-800) 60%, transparent))`,
                      }}
                    >
                      <div className="text-center">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                          style={{
                            background: `color-mix(in srgb, var(--color-surface-600) 40%, transparent)`,
                          }}
                        >
                          {item.type === "ingredient" ? (
                            <IconLeaf
                              size={20}
                              style={{ color: "var(--color-primary-400)" }}
                            />
                          ) : (
                            <IconChefHat
                              size={20}
                              style={{ color: "var(--color-secondary-400)" }}
                            />
                          )}
                        </div>
                        <Text
                          size="xs"
                          style={{ color: "var(--color-surface-400)" }}
                        >
                          No image
                        </Text>
                      </div>
                    </div>
                  )}

                  {/* Type Badge Overlay */}
                  <div className="absolute top-3 left-3">
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                      style={{
                        background:
                          item.type === "ingredient"
                            ? `color-mix(in srgb, var(--color-primary-500) 20%, transparent)`
                            : `color-mix(in srgb, var(--color-secondary-500) 20%, transparent)`,
                        border: `1px solid ${
                          item.type === "ingredient"
                            ? "var(--color-primary-400)"
                            : "var(--color-secondary-400)"
                        }`,
                        color:
                          item.type === "ingredient"
                            ? "var(--color-primary-300)"
                            : "var(--color-secondary-300)",
                      }}
                    >
                      {getItemTypeLabel(item.type)}
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Menu shadow="md" width={160}>
                      <Menu.Target>
                        <button
                          className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-110"
                          style={{
                            background: `color-mix(in srgb, var(--color-surface-900) 80%, transparent)`,
                            border: `1px solid color-mix(in srgb, var(--color-surface-600) 40%, transparent)`,
                          }}
                        >
                          <IconDotsVertical
                            size={14}
                            style={{ color: "var(--color-surface-300)" }}
                          />
                        </button>
                      </Menu.Target>

                      <Menu.Dropdown
                        style={{
                          backgroundColor: "var(--color-surface-900)",
                          border:
                            "1px solid color-mix(in srgb, var(--color-surface-600) 40%, transparent)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        {onView && (
                          <Menu.Item
                            leftSection={<IconEye size={14} />}
                            onClick={() => onView(item)}
                            style={{ color: "var(--color-surface-200)" }}
                          >
                            View Details
                          </Menu.Item>
                        )}
                        {onEdit && (
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => onEdit(item)}
                            style={{ color: "var(--color-surface-200)" }}
                          >
                            Edit
                          </Menu.Item>
                        )}
                        {onDelete && (
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color={
                              deleteConfirm === item.id ? "red" : undefined
                            }
                            onClick={() => handleDelete(item)}
                            style={{
                              color:
                                deleteConfirm === item.id
                                  ? "var(--color-error-400)"
                                  : "var(--color-surface-200)",
                            }}
                          >
                            {deleteConfirm === item.id
                              ? "Confirm Delete"
                              : "Delete"}
                          </Menu.Item>
                        )}
                      </Menu.Dropdown>
                    </Menu>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 space-y-3">
                  <div>
                    <Text
                      fw={500}
                      size="md"
                      style={{
                        color: "var(--color-surface-100)",
                        lineHeight: "1.3",
                      }}
                      className="truncate"
                    >
                      {item.name}
                    </Text>
                  </div>

                  <Text
                    size="xs"
                    style={{ color: "var(--color-surface-400)" }}
                    className="truncate"
                  >
                    {getItemAdditionalInfo(item)}
                  </Text>

                  {item.calories_per_100g_or_ml && (
                    <div
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                      style={{
                        background: `color-mix(in srgb, var(--color-primary-500) 10%, transparent)`,
                        color: "var(--color-primary-300)",
                      }}
                    >
                      {item.calories_per_100g_or_ml} cal/100g
                    </div>
                  )}

                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs"
                          style={{
                            background: `color-mix(in srgb, var(--color-surface-600) 30%, transparent)`,
                            color: "var(--color-surface-300)",
                          }}
                        >
                          {tag.replace(/_/g, " ")}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs"
                          style={{
                            background: `color-mix(in srgb, var(--color-surface-600) 30%, transparent)`,
                            color: "var(--color-surface-400)",
                            border: `1px solid color-mix(in srgb, var(--color-surface-500) 40%, transparent)`,
                          }}
                        >
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UnifiedItemsList;

import { useQuery } from "convex/react"
import { LucideUser } from "lucide-react"
import { api } from "../../../../../../../../../convex/_generated/api"
import { Doc } from "../../../../../../../../../convex/_generated/dataModel"
import { Input } from "../../../../../../../../components/ui/input"
import { Label } from "../../../../../../../../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../../../components/ui/select"
import { Textarea } from "../../../../../../../../components/ui/textarea"
import UserAvatar from "../../../../../../../../components/UserAvatar"

export interface Props {
  isNew?: boolean
  editable: boolean
  company:
    | (Doc<"companies"> & {
        owners: (Doc<"companyOwners"> & { user: Doc<"users"> })[]
      })
    | Omit<
        Doc<"companies"> & {
          owners: (Doc<"companyOwners"> & { user: Doc<"users"> })[]
        },
        "_id" | "_creationTime"
      >
  onCompanyUpdate: (company: Partial<Doc<"companies">>) => void
}

export default function CompanyForm({
  isNew,
  editable,
  company,
  onCompanyUpdate,
}: Props) {
  const currentUser = useQuery(api.users.getCurrentUser)

  const isOwner = isNew
    ? true
    : company.owners!.some((owner) => owner.userId === currentUser?._id)
  const isOwnerAndEditable = editable && isOwner

  return (
    <div className="space-y-6 py-2">
      <div className="space-y-2">
        <Label htmlFor="company-name">Company Name</Label>
        {isOwnerAndEditable ? (
          <Input
            id="company-name"
            placeholder="Enter company name"
            required
            value={company.name}
            onChange={(e) => onCompanyUpdate({ name: e.target.value })}
          />
        ) : (
          <span className="block text-sm">{company.name}</span>
        )}
      </div>
      {(isOwnerAndEditable || company.description) && (
        <div className="space-y-2">
          <Label htmlFor="description">Company Description</Label>

          {isOwnerAndEditable ? (
            <Textarea
              id="description"
              placeholder="Tell us about your company..."
              rows={4}
              value={company.description}
              onChange={(e) => onCompanyUpdate({ description: e.target.value })}
            />
          ) : (
            <span className="block text-sm">{company.description}</span>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {(isOwnerAndEditable || company.yearFounded) && (
          <div className="space-y-2">
            <Label htmlFor="year-founded">Year Founded</Label>
            {isOwnerAndEditable ? (
              <Input
                id="year-founded"
                type="number"
                placeholder="2024"
                value={company.yearFounded}
                onChange={(e) =>
                  onCompanyUpdate({ yearFounded: Number(e.target.value) })
                }
                min={1900}
                max={new Date().getFullYear()}
              />
            ) : (
              <span className="block text-sm">{company.yearFounded}</span>
            )}
          </div>
        )}
        {(isOwnerAndEditable || company.employees) && (
          <div className="space-y-2">
            <Label htmlFor="employees">Number of Employees</Label>
            {isOwnerAndEditable ? (
              <Select
                value={company.employees}
                onValueChange={(value) => onCompanyUpdate({ employees: value })}
              >
                <SelectTrigger id="employees">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10</SelectItem>
                  <SelectItem value="11-50">11-50</SelectItem>
                  <SelectItem value="51-200">51-200</SelectItem>
                  <SelectItem value="201-500">201-500</SelectItem>
                  <SelectItem value="501-1000">501-1000</SelectItem>
                  <SelectItem value="1000+">1000+</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span className="block text-sm">{company.employees}</span>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {(isOwnerAndEditable || company.city) && (
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            {isOwnerAndEditable ? (
              <Input
                id="city"
                placeholder="City"
                value={company.city}
                onChange={(e) => onCompanyUpdate({ city: e.target.value })}
              />
            ) : (
              <span className="block text-sm">{company.city}</span>
            )}
          </div>
        )}
        {(isOwnerAndEditable || company.stateProvince) && (
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            {isOwnerAndEditable ? (
              <Input
                id="state"
                placeholder="State"
                value={company.stateProvince}
                onChange={(e) =>
                  onCompanyUpdate({ stateProvince: e.target.value })
                }
              />
            ) : (
              <span className="block text-sm">{company.stateProvince}</span>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {(isOwnerAndEditable || company.country) && (
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            {isOwnerAndEditable ? (
              <Input
                id="country"
                placeholder="Country"
                value={company.country}
                onChange={(e) => onCompanyUpdate({ country: e.target.value })}
              />
            ) : (
              <span className="block text-sm">{company.country}</span>
            )}
          </div>
        )}
        {(isOwnerAndEditable || company.website) && (
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            {isOwnerAndEditable ? (
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={company.website}
                onChange={(e) => onCompanyUpdate({ website: e.target.value })}
              />
            ) : (
              <a
                className="block text-sm underline"
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {company.website}
              </a>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="owners">Owners</Label>
        <div className="flex flex-col gap-2">
          {isNew && currentUser && (
            <div className="flex items-center gap-2">
              <UserAvatar user={currentUser} />
              <span>{currentUser?.name || currentUser?.email}</span>
            </div>
          )}
          {company.owners?.map((owner) => (
            <div key={owner._id} className="flex items-center gap-2">
              {owner.user ? (
                <>
                  <UserAvatar user={owner.user} />
                  <span key={owner._id}>
                    {owner.user.name || owner.user.email}
                  </span>
                </>
              ) : (
                <>
                  <LucideUser className="h-4 w-4" />
                  <span key={owner._id}>{owner.name || owner.email}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* <div className="space-y-2">
        <Label htmlFor="logo">Company Logo</Label>
        <div className="rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50">
          <Icon
            icon="solar:upload-bold"
            className="mx-auto mb-3 size-10 text-muted-foreground"
          />
          <p className="mb-2 text-sm text-muted-foreground">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            SVG, PNG, JPG or GIF (max. 2MB)
          </p>
          <Input id="logo" type="file" className="hidden" accept="image/*" />
        </div>
      </div> */}
    </div>
  )
}

sed -i 's/theme.activeCampaign/theme.config/g' src/pages/Admissions.tsx
sed -i 's/{activeCampaign.title}/{activeCampaign?.title || "Admissions"}/g' src/pages/Admissions.tsx
sed -i 's/{activeCampaign.description}/{activeCampaign?.description || "Admissions are currently closed."}/g' src/pages/Admissions.tsx
sed -i 's/!activeCampaign.isActive/!activeCampaign/g' src/pages/Admissions.tsx

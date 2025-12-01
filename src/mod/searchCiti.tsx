import { AppCiti } from "./sociti";
import { AppDataType } from "../Type";
//渲染搜索结果
const searchResult = async (query: string, AppData: AppDataType | undefined) => {
  if (!AppData?.language) return [];
  const data = await AppCiti(query, AppData.language)
  if (data.code !== '200') return [];
  const CityList = data?.location || data?.topCityList
  console.log(data);

  return CityList
    .map((e: any) => {
      return {
        value: formatCityDisplayByHierarchy(e),
        key: e.id,
        position: { lat: e.lat, lng: e.lon, tzid: e.tz },
        label: (
          <div
            key={e.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>
              {e.country}
              <a
              >
                {formatCityDisplayByHierarchy(e)}
              </a>
            </span>

          </div>
        ),
      };
    });
}

export { searchResult }
export const formatCityDisplayByHierarchy = (cityData: any): string => {
  const { adm1, adm2, name } = cityData;

  // 推断行政层级关系
  const inferHierarchy = () => {
    // 如果 adm1 和 adm2 完全相同，可能是直辖市或特殊城市
    if (adm1 === adm2) {
      return 'same_level';
    }

    // 如果 adm2 和 name 相同，可能是城市与其下辖区同名
    if (adm2 === name) {
      return 'city_district_same';
    }

    // 如果三个字段都不同，则是完整的省-市-区层级
    if (adm1 !== adm2 && adm2 !== name && adm1 !== name) {
      return 'full_hierarchy';
    }

    return 'unknown';
  };

  const hierarchy = inferHierarchy();

  switch (hierarchy) {
    case 'same_level':
      // adm1 和 adm2 相同：显示为 "adm1 - name"
      return `${adm1} - ${name}`;

    case 'city_district_same':
      // adm2 和 name 相同：显示为 "adm1 - adm2"
      return `${adm1} - ${adm2}`;

    case 'full_hierarchy':
      // 完整的三个层级：显示为 "adm1 - adm2 - name"
      return `${adm1} - ${adm2} - ${name}`;

    default:
      // 未知情况：去重后连接
      const parts = [adm1, adm2, name].filter(
        (part, index, array) => part && part !== array[index - 1]
      );
      return parts.join(' - ');
  }
};